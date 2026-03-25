import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto, DeleteDocumentDto, ListDocumentDto } from './dto/update-document.dto';
import { DocumentListResponse } from './interfaces/document-info.interface';

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

    const [items, total] = await Promise.all([
      this.prisma.document.findMany({
        where: { userId },
        select: { id: true, title: true, createdAt: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.document.count({ where: { userId } }),
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
      data: { content: version.content },
    });
  }
}
