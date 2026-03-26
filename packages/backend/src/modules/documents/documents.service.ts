import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto, DeleteDocumentDto, ListDocumentDto } from './dto/update-document.dto';
import { DocumentListResponse } from './interfaces/document-info.interface';
import { Prisma } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async find(id: number) {
    return this.prisma.document.findUnique({ where: { id } });
  }

  async create(dto: CreateDocumentDto, userId: number) {
    return this.prisma.document.create({
      data: {
        title: dto.title,
        content: dto.content ?? {},
        userId,
      },
    });
  }

  async update(dto: UpdateDocumentDto, userId: number) {
    const doc = await this.prisma.document.findUnique({ where: { id: dto.id } });
    if (!doc) {
      throw new NotFoundException('Document not found');
    }
    if (doc.userId !== userId) {
      throw new ForbiddenException('You do not own this document');
    }

    // Create version snapshot before updating
    await this.createVersion(doc);

    return this.prisma.document.update({
      where: { id: dto.id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.content !== undefined && { content: dto.content }),
      },
    });
  }

  async delete(dto: DeleteDocumentDto, userId: number) {
    const doc = await this.prisma.document.findUnique({ where: { id: dto.id } });
    if (!doc) {
      throw new NotFoundException('Document not found');
    }
    if (doc.userId !== userId) {
      throw new ForbiddenException('You do not own this document');
    }
    return this.prisma.document.delete({ where: { id: dto.id } });
  }

  async findAllByUser(dto: ListDocumentDto, userId: number): Promise<DocumentListResponse> {
    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: any = { userId };
    if (dto.folderId !== undefined) {
      where.parentId = dto.folderId;
    }

    const [items, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        select: { id: true, title: true, createdAt: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      total,
      page,
      pageSize,
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
    };
  }

  async createVersion(doc: { id: number; title: string; content: any; userId: number }) {
    const latestVersion = await this.prisma.documentVersion.findFirst({
      where: { documentId: doc.id },
      orderBy: { version: 'desc' },
    });
    const nextVersion = (latestVersion?.version ?? 0) + 1;
    return this.prisma.documentVersion.create({
      data: {
        documentId: doc.id,
        version: nextVersion,
        content: doc.content,
      },
    });
  }

  async getVersions(documentId: number) {
    return this.prisma.documentVersion.findMany({
      where: { documentId },
      orderBy: { version: 'desc' },
      select: { id: true, version: true, updatedAt: true },
    });
  }

  async rollback(documentId: number, versionId: number, userId: number) {
    const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document not found');
    if (doc.userId !== userId) throw new ForbiddenException('You do not own this document');

    const version = await this.prisma.documentVersion.findUnique({ where: { id: versionId } });
    if (!version) throw new NotFoundException('Version not found');

    await this.createVersion(doc);
    return this.prisma.document.update({
      where: { id: documentId },
      data: { content: version.content as any },
    });
  }

  async share(documentId: number, targetUserId: number, permission: 'viewer' | 'editor', ownerId: number) {
    const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document not found');
    if (doc.userId !== ownerId) throw new ForbiddenException('You do not own this document');

    const share = await this.prisma.documentShare.upsert({
      where: { documentId_userId: { documentId, userId: targetUserId } },
      update: { permission },
      create: { documentId, userId: targetUserId, permission },
    });
    return share;
  }

  async revokeShare(documentId: number, targetUserId: number, userId: number) {
    const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document not found');
    if (doc.userId !== userId) throw new ForbiddenException('You do not own this document');

    await this.prisma.documentShare.deleteMany({
      where: { documentId, userId: targetUserId },
    });
    return { success: true };
  }

  async generateShareLink(documentId: number, userId: number) {
    const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document not found');
    if (doc.userId !== userId) throw new ForbiddenException('You do not own this document');

    const shareToken = doc.shareToken ?? crypto.randomBytes(16).toString('hex');
    const updated = await this.prisma.document.update({
      where: { id: documentId },
      data: { shareToken, isPublic: true },
    });
    return { shareToken: updated.shareToken };
  }

  async findByShareToken(shareToken: string) {
    const doc = await this.prisma.document.findUnique({ where: { shareToken } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async getShares(documentId: number, userId: number) {
    const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document not found');
    if (doc.userId !== userId) throw new ForbiddenException('You do not own this document');

    return this.prisma.documentShare.findMany({
      where: { documentId },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });
  }

  async search(query: string, userId: number) {
    return this.prisma.document.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: { id: true, title: true, createdAt: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });
  }

  async findSharedWithUser(userId: number) {
    const shares = await this.prisma.documentShare.findMany({
      where: { userId },
      include: {
        document: {
          select: { id: true, title: true, createdAt: true, updatedAt: true },
        },
      },
    });
    return shares.map((s) => ({
      id: s.document.id,
      title: s.document.title,
      permission: s.permission,
      createdAt: s.document.createdAt.toISOString(),
      updatedAt: s.document.updatedAt.toISOString(),
    }));
  }

  // ──────────────────────────────────────────────
  // Folder operations
  // ──────────────────────────────────────────────

  async createFolder(title: string, userId: number, parentId?: number) {
    // Validate parent if provided
    if (parentId !== undefined) {
      const parent = await this.prisma.document.findUnique({ where: { id: parentId } });
      if (!parent) throw new NotFoundException('Parent folder not found');
      if (!parent.isFolder) throw new BadRequestException('Parent is not a folder');
      if (parent.userId !== userId) throw new ForbiddenException('You do not own the parent folder');
    }
    return this.prisma.document.create({
      data: {
        title,
        content: Prisma.DbNull,
        isFolder: true,
        userId,
        parentId: parentId ?? null,
      },
    });
  }

  async getTree(userId: number) {
    // Fetch all documents and folders owned by user (not shared ones for tree view)
    const all = await this.prisma.document.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        isFolder: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { title: 'asc' },
    });

    // Build tree: only top-level items (parentId === null) + their children
    const buildNode = (item: typeof all[number]): {
      id: number;
      title: string;
      isFolder: boolean;
      createdAt: string;
      updatedAt: string;
      children: any[];
    } => {
      const children = all
        .filter((d) => d.parentId === item.id)
        .map(buildNode);
      return {
        id: item.id,
        title: item.title,
        isFolder: item.isFolder,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        children,
      };
    };

    return all
      .filter((d) => d.parentId === null)
      .map(buildNode);
  }

  async moveDocument(id: number, parentId: number | null, userId: number) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    if (doc.userId !== userId) throw new ForbiddenException('You do not own this document');

    // Prevent moving a folder into itself or its descendants (simple check: same id)
    if (parentId !== null && id === parentId) {
      throw new BadRequestException('Cannot move a folder into itself');
    }

    // Validate parent if provided
    if (parentId !== null) {
      const parent = await this.prisma.document.findUnique({ where: { id: parentId } });
      if (!parent) throw new NotFoundException('Target folder not found');
      if (!parent.isFolder) throw new BadRequestException('Target is not a folder');
      if (parent.userId !== userId) throw new ForbiddenException('You do not own the target folder');
    }

    return this.prisma.document.update({
      where: { id },
      data: { parentId: parentId ?? null },
    });
  }
}
