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

  describe('create', () => {
    it('should create a document', async () => {
      const dto = { title: 'New Doc' };
      const userId = 1;
      const mockCreated = { id: 1, title: 'New Doc', content: {}, userId: 1 };
      mockPrisma.document.create.mockResolvedValue(mockCreated);
      const result = await service.create(dto, userId);
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

  describe('update', () => {
    it('should update document when user owns it', async () => {
      const existing = { id: 1, title: 'Old', content: {}, userId: 1 };
      mockPrisma.document.findUnique.mockResolvedValue(existing);
      mockPrisma.documentVersion.findFirst.mockResolvedValue(null);
      mockPrisma.document.update.mockResolvedValue({ id: 1, title: 'Updated' });
      mockPrisma.document.create.mockResolvedValue(existing);

      const result = await service.update({ id: 1, title: 'Updated' }, 1);
      expect(result.title).toBe('Updated');
    });

    it('should throw NotFoundException when document not found', async () => {
      mockPrisma.document.findUnique.mockResolvedValue(null);
      await expect(service.update({ id: 999 }, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user does not own document', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 1, userId: 99 });
      await expect(service.update({ id: 1 }, 1)).rejects.toThrow(ForbiddenException);
    });
  });

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

    it('should use default pagination values', async () => {
      mockPrisma.document.findMany.mockResolvedValue([]);
      mockPrisma.document.count.mockResolvedValue(0);
      await service.findAllByUser({}, 1);
      expect(mockPrisma.document.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });
  });

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

  describe('share', () => {
    it('should create share record', async () => {
      const doc = { id: 1, userId: 1 };
      mockPrisma.document.findUnique.mockResolvedValue(doc);
      mockPrisma.documentShare.upsert.mockResolvedValue({ id: 1, documentId: 1, userId: 2, permission: 'viewer' });

      const result = await service.share(1, 1, 'viewer');
      expect(result.permission).toBe('viewer');
    });

    it('should throw ForbiddenException if not owner', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 1, userId: 99 });
      await expect(service.share(1, 1, 'viewer')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('generateShareLink', () => {
    it('should generate share token for owner', async () => {
      const doc = { id: 1, userId: 1, shareToken: null };
      mockPrisma.document.findUnique.mockResolvedValue(doc);
      mockPrisma.document.update.mockResolvedValue({ ...doc, shareToken: 'abc123' });

      const result = await service.generateShareLink(1, 1);
      expect(result.shareToken).toBe('abc123');
    });

    it('should throw ForbiddenException if not owner', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 1, userId: 99 });
      await expect(service.generateShareLink(1, 1)).rejects.toThrow(ForbiddenException);
    });
  });

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
  });
});
