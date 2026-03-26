import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from '../../documents/documents.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

const mockPrisma = {
  document: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  documentVersion: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  documentShare: {
    upsert: jest.fn(),
    deleteMany: jest.fn(),
    findMany: jest.fn(),
  },
} as any;

describe('DocumentsService', () => {
  let service: DocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────
  // find
  // ──────────────────────────────────────────────
  describe('find', () => {
    it('should return a document by id', async () => {
      const mockDoc = { id: 1, title: 'Test', content: {}, userId: 1 };
      mockPrisma.document.findUnique.mockResolvedValue(mockDoc);
      const result = await service.find(1);
      expect(result).toEqual(mockDoc);
      expect(mockPrisma.document.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return null when document not found', async () => {
      mockPrisma.document.findUnique.mockResolvedValue(null);
      const result = await service.find(999);
      expect(result).toBeNull();
    });
  });

  // ──────────────────────────────────────────────
  // create
  // ──────────────────────────────────────────────
  describe('create', () => {
    it('should create a document with default empty content', async () => {
      const dto = { title: 'New Doc' };
      const mockCreated = { id: 1, title: 'New Doc', content: {}, userId: 1 };
      mockPrisma.document.create.mockResolvedValue(mockCreated);
      const result = await service.create(dto, 1);
      expect(result).toEqual(mockCreated);
      expect(mockPrisma.document.create).toHaveBeenCalledWith({
        data: { title: 'New Doc', content: {}, userId: 1 },
      });
    });

    it('should create with provided content', async () => {
      const dto = { title: 'New Doc', content: { text: 'hello' } };
      mockPrisma.document.create.mockResolvedValue({ id: 1, ...dto, userId: 1 });
      await service.create(dto, 1);
      expect(mockPrisma.document.create).toHaveBeenCalledWith({
        data: { title: 'New Doc', content: { text: 'hello' }, userId: 1 },
      });
    });
  });

  // ──────────────────────────────────────────────
  // update
  // ──────────────────────────────────────────────
  describe('update', () => {
    it('should update document when user owns it', async () => {
      const existing = { id: 1, title: 'Old', content: {}, userId: 1 };
      mockPrisma.document.findUnique.mockResolvedValue(existing);
      mockPrisma.documentVersion.findFirst.mockResolvedValue(null); // no prior version
      mockPrisma.documentVersion.create.mockResolvedValue({ id: 1 });
      mockPrisma.document.update.mockResolvedValue({ id: 1, title: 'Updated' });
      const result = await service.update({ id: 1, title: 'Updated' }, 1);
      expect(result.title).toBe('Updated');
      // verify createVersion was called (snapshot taken)
      expect(mockPrisma.documentVersion.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when document not found', async () => {
      mockPrisma.document.findUnique.mockResolvedValue(null);
      await expect(service.update({ id: 999 }, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user does not own document', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 1, userId: 99 });
      await expect(service.update({ id: 1 }, 1)).rejects.toThrow(ForbiddenException);
    });

    it('should create version snapshot with correct next version number', async () => {
      const existing = { id: 1, title: 'Old', content: { v: 1 }, userId: 1 };
      mockPrisma.document.findUnique.mockResolvedValue(existing);
      mockPrisma.documentVersion.findFirst.mockResolvedValue({ version: 3 }); // latest is v3
      mockPrisma.documentVersion.create.mockResolvedValue({ id: 1 });
      mockPrisma.document.update.mockResolvedValue({ id: 1, title: 'Updated', content: { v: 2 } });
      await service.update({ id: 1, title: 'Updated' }, 1);
      expect(mockPrisma.documentVersion.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ documentId: 1, version: 4 }),
      });
    });
  });

  // ──────────────────────────────────────────────
  // delete
  // ──────────────────────────────────────────────
  describe('delete', () => {
    it('should delete document when user owns it', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 1, userId: 1 });
      mockPrisma.document.delete.mockResolvedValue({ id: 1 });
      await expect(service.delete({ id: 1 }, 1)).resolves.toEqual({ id: 1 });
    });

    it('should throw NotFoundException when document not found', async () => {
      mockPrisma.document.findUnique.mockResolvedValue(null);
      await expect(service.delete({ id: 999 }, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user does not own document', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 1, userId: 99 });
      await expect(service.delete({ id: 1 }, 1)).rejects.toThrow(ForbiddenException);
    });
  });

  // ──────────────────────────────────────────────
  // findAllByUser
  // ──────────────────────────────────────────────
  describe('findAllByUser', () => {
    it('should return paginated document list', async () => {
      const docs = [
        { id: 1, title: 'Doc 1', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, title: 'Doc 2', createdAt: new Date(), updatedAt: new Date() },
      ];
      mockPrisma.document.findMany.mockResolvedValue(docs);
      mockPrisma.document.count.mockResolvedValue(2);
      const result = await service.findAllByUser({ page: 1, pageSize: 20 }, 1);
      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });

    it('should use default pagination values when not provided', async () => {
      mockPrisma.document.findMany.mockResolvedValue([]);
      mockPrisma.document.count.mockResolvedValue(0);
      await service.findAllByUser({}, 1);
      expect(mockPrisma.document.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });

    it('should calculate correct skip for page 3', async () => {
      mockPrisma.document.findMany.mockResolvedValue([]);
      mockPrisma.document.count.mockResolvedValue(0);
      await service.findAllByUser({ page: 3, pageSize: 10 }, 1);
      expect(mockPrisma.document.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });

    it('should map dates to ISO strings', async () => {
      const now = new Date('2024-01-01T00:00:00Z');
      mockPrisma.document.findMany.mockResolvedValue([
        { id: 1, title: 'Doc', createdAt: now, updatedAt: now },
      ]);
      mockPrisma.document.count.mockResolvedValue(1);
      const result = await service.findAllByUser({ page: 1, pageSize: 20 }, 1);
      expect(result.items[0].createdAt).toBe('2024-01-01T00:00:00.000Z');
    });
  });

  // ──────────────────────────────────────────────
  // createVersion
  // ──────────────────────────────────────────────
  describe('createVersion', () => {
    it('should create first version as v1 when no prior version exists', async () => {
      const doc = { id: 1, title: 'Doc', content: { text: 'hello' }, userId: 1 };
      mockPrisma.documentVersion.findFirst.mockResolvedValue(null);
      mockPrisma.documentVersion.create.mockResolvedValue({ id: 1, version: 1 });
      await service.createVersion(doc);
      expect(mockPrisma.documentVersion.create).toHaveBeenCalledWith({
        data: { documentId: 1, version: 1, content: { text: 'hello' } },
      });
    });

    it('should increment version number correctly', async () => {
      const doc = { id: 1, title: 'Doc', content: {}, userId: 1 };
      mockPrisma.documentVersion.findFirst.mockResolvedValue({ version: 5 });
      mockPrisma.documentVersion.create.mockResolvedValue({ id: 1, version: 6 });
      await service.createVersion(doc);
      expect(mockPrisma.documentVersion.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ version: 6 }),
      });
    });
  });

  // ──────────────────────────────────────────────
  // getVersions
  // ──────────────────────────────────────────────
  describe('getVersions', () => {
    it('should return version list sorted desc', async () => {
      const versions = [
        { id: 2, version: 2, updatedAt: new Date() },
        { id: 1, version: 1, updatedAt: new Date() },
      ];
      mockPrisma.documentVersion.findMany.mockResolvedValue(versions);
      const result = await service.getVersions(1);
      expect(result).toHaveLength(2);
      expect(mockPrisma.documentVersion.findMany).toHaveBeenCalledWith({
        where: { documentId: 1 },
        orderBy: { version: 'desc' },
        select: { id: true, version: true, updatedAt: true },
      });
    });
  });

  // ──────────────────────────────────────────────
  // rollback
  // ──────────────────────────────────────────────
  describe('rollback', () => {
    it('should rollback document content to specified version', async () => {
      const doc = { id: 1, userId: 1, content: { current: true } };
      const version = { id: 5, documentId: 1, version: 3, content: { old: true } };
      mockPrisma.document.findUnique.mockResolvedValue(doc);
      mockPrisma.documentVersion.findUnique.mockResolvedValue(version);
      mockPrisma.documentVersion.create.mockResolvedValue({ id: 2 }); // snapshot before rollback
      mockPrisma.document.update.mockResolvedValue({ ...doc, content: { old: true } });
      const result = await service.rollback(1, 5, 1);
      expect(result.content).toEqual({ old: true });
    });

    it('should throw NotFoundException when document not found', async () => {
      mockPrisma.document.findUnique.mockResolvedValue(null);
      await expect(service.rollback(999, 5, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user does not own document', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 1, userId: 99 });
      await expect(service.rollback(1, 5, 1)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when version not found', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 1, userId: 1 });
      mockPrisma.documentVersion.findUnique.mockResolvedValue(null);
      await expect(service.rollback(1, 999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  // ──────────────────────────────────────────────
  // share
  // ──────────────────────────────────────────────
  describe('share', () => {
    it('should create share record for target user', async () => {
      const doc = { id: 1, userId: 1 };
      mockPrisma.document.findUnique.mockResolvedValue(doc);
      mockPrisma.documentShare.upsert.mockResolvedValue({ id: 1, documentId: 1, userId: 2, permission: 'viewer' });
      const result = await service.share(1, 2, 'viewer', 1); // documentId=1, target=2, owner=1
      expect(result.permission).toBe('viewer');
    });

    it('should update existing share record when resharing', async () => {
      const doc = { id: 1, userId: 1 };
      mockPrisma.document.findUnique.mockResolvedValue(doc);
      mockPrisma.documentShare.upsert.mockResolvedValue({ id: 1, documentId: 1, userId: 2, permission: 'editor' });
      const result = await service.share(1, 2, 'editor', 1);
      expect(result.permission).toBe('editor');
      expect(mockPrisma.documentShare.upsert).toHaveBeenCalledWith({
        where: { documentId_userId: { documentId: 1, userId: 2 } },
        update: { permission: 'editor' },
        create: { documentId: 1, userId: 2, permission: 'editor' },
      });
    });

    it('should throw NotFoundException when document not found', async () => {
      mockPrisma.document.findUnique.mockResolvedValue(null);
      await expect(service.share(999, 2, 'viewer', 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not owner', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 1, userId: 99 });
      await expect(service.share(1, 2, 'viewer', 1)).rejects.toThrow(ForbiddenException);
    });
  });

  // ──────────────────────────────────────────────
  // revokeShare
  // ──────────────────────────────────────────────
  describe('revokeShare', () => {
    it('should revoke share successfully', async () => {
      const doc = { id: 1, userId: 1 };
      mockPrisma.document.findUnique.mockResolvedValue(doc);
      mockPrisma.documentShare.deleteMany.mockResolvedValue({ count: 1 });
      const result = await service.revokeShare(1, 2, 1);
      expect(result).toEqual({ success: true });
      expect(mockPrisma.documentShare.deleteMany).toHaveBeenCalledWith({
        where: { documentId: 1, userId: 2 },
      });
    });

    it('should throw NotFoundException when document not found', async () => {
      mockPrisma.document.findUnique.mockResolvedValue(null);
      await expect(service.revokeShare(999, 2, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user does not own document', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 1, userId: 99 });
      await expect(service.revokeShare(1, 2, 1)).rejects.toThrow(ForbiddenException);
    });
  });

  // ──────────────────────────────────────────────
  // generateShareLink
  // ──────────────────────────────────────────────
  describe('generateShareLink', () => {
    it('should generate share token for owner', async () => {
      const doc = { id: 1, userId: 1, shareToken: null };
      mockPrisma.document.findUnique.mockResolvedValue(doc);
      mockPrisma.document.update.mockResolvedValue({ ...doc, shareToken: 'abc123' });
      const result = await service.generateShareLink(1, 1);
      expect(result.shareToken).toBe('abc123');
    });

    it('should reuse existing share token if already set', async () => {
      const doc = { id: 1, userId: 1, shareToken: 'existing-token' };
      mockPrisma.document.findUnique.mockResolvedValue(doc);
      mockPrisma.document.update.mockResolvedValue(doc);
      const result = await service.generateShareLink(1, 1);
      expect(result.shareToken).toBe('existing-token');
      // update should still be called to set isPublic=true
      expect(mockPrisma.document.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { shareToken: 'existing-token', isPublic: true },
      });
    });

    it('should throw NotFoundException when document not found', async () => {
      mockPrisma.document.findUnique.mockResolvedValue(null);
      await expect(service.generateShareLink(999, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not owner', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 1, userId: 99 });
      await expect(service.generateShareLink(1, 1)).rejects.toThrow(ForbiddenException);
    });
  });

  // ──────────────────────────────────────────────
  // findByShareToken
  // ──────────────────────────────────────────────
  describe('findByShareToken', () => {
    it('should return document by share token', async () => {
      const doc = { id: 1, title: 'Shared Doc', content: {} };
      mockPrisma.document.findUnique.mockResolvedValue(doc);
      const result = await service.findByShareToken('abc123');
      expect(result).toEqual(doc);
      expect(mockPrisma.document.findUnique).toHaveBeenCalledWith({ where: { shareToken: 'abc123' } });
    });

    it('should throw NotFoundException when token invalid', async () => {
      mockPrisma.document.findUnique.mockResolvedValue(null);
      await expect(service.findByShareToken('invalid-token')).rejects.toThrow(NotFoundException);
    });
  });

  // ──────────────────────────────────────────────
  // getShares
  // ──────────────────────────────────────────────
  describe('getShares', () => {
    it('should return shares with user info for owner', async () => {
      const doc = { id: 1, userId: 1 };
      const shares = [
        { id: 1, userId: 2, permission: 'viewer', user: { id: 2, name: 'Alice', avatar: 'url' } },
      ];
      mockPrisma.document.findUnique.mockResolvedValue(doc);
      mockPrisma.documentShare.findMany.mockResolvedValue(shares);
      const result = await service.getShares(1, 1);
      expect(result).toEqual(shares);
    });

    it('should throw NotFoundException when document not found', async () => {
      mockPrisma.document.findUnique.mockResolvedValue(null);
      await expect(service.getShares(999, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not owner', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 1, userId: 99 });
      await expect(service.getShares(1, 1)).rejects.toThrow(ForbiddenException);
    });
  });

  // ──────────────────────────────────────────────
  // search
  // ──────────────────────────────────────────────
  describe('search', () => {
    it('should return matching documents', async () => {
      const docs = [{ id: 1, title: 'Test Doc', createdAt: new Date(), updatedAt: new Date() }];
      mockPrisma.document.findMany.mockResolvedValue(docs);
      const result = await service.search('Test', 1);
      expect(result).toHaveLength(1);
      expect(mockPrisma.document.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 1,
            OR: [{ title: { contains: 'Test', mode: 'insensitive' } }],
          }),
        }),
      );
    });

    it('should limit results to 20', async () => {
      mockPrisma.document.findMany.mockResolvedValue([]);
      await service.search('x', 1);
      expect(mockPrisma.document.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 20 }),
      );
    });
  });

  // ──────────────────────────────────────────────
  // findSharedWithUser
  // ──────────────────────────────────────────────
  describe('findSharedWithUser', () => {
    it('should return documents shared with current user', async () => {
      const shares = [
        {
          document: { id: 5, title: 'Shared Doc', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-02') },
          permission: 'editor',
        },
      ];
      mockPrisma.documentShare.findMany.mockResolvedValue(shares);
      const result = await service.findSharedWithUser(1);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(5);
      expect(result[0].permission).toBe('editor');
    });

    it('should return empty array when no shares', async () => {
      mockPrisma.documentShare.findMany.mockResolvedValue([]);
      const result = await service.findSharedWithUser(1);
      expect(result).toHaveLength(0);
    });

    it('should map dates to ISO strings', async () => {
      const now = new Date('2024-06-01T10:00:00Z');
      mockPrisma.documentShare.findMany.mockResolvedValue([
        { document: { id: 1, title: 'D', createdAt: now, updatedAt: now }, permission: 'viewer' },
      ]);
      const result = await service.findSharedWithUser(1);
      expect(result[0].createdAt).toBe('2024-06-01T10:00:00.000Z');
    });
  });
});
