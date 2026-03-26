import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from '../documents.controller';
import { DocumentsService } from '../documents.service';
import { AuthGuard } from '../../auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

const mockDocumentsService = {
  find: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAllByUser: jest.fn(),
  getVersions: jest.fn(),
  rollback: jest.fn(),
  share: jest.fn(),
  revokeShare: jest.fn(),
  generateShareLink: jest.fn(),
  findByShareToken: jest.fn(),
  getShares: jest.fn(),
  search: jest.fn(),
  findSharedWithUser: jest.fn(),
  getTree: jest.fn(),
  createFolder: jest.fn(),
  moveDocument: jest.fn(),
};

const mockJwtService = {
  verify: jest.fn(),
};

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let mockReq: Partial<Request>;

  beforeEach(async () => {
    mockReq = { _user: { userId: 1 } } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        { provide: DocumentsService, useValue: mockDocumentsService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DocumentsController>(DocumentsController);
    jest.clearAllMocks();
  });

  describe('find', () => {
    it('should return a document by id', async () => {
      const mockDoc = { id: 1, title: 'Test', content: {}, userId: 1 };
      mockDocumentsService.find.mockResolvedValue(mockDoc);

      const result = await controller.find(1);
      expect(result!.id).toBe(1);
      expect(mockDocumentsService.find).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a document', async () => {
      const dto = { title: 'New Doc' };
      mockDocumentsService.create.mockResolvedValue({ id: 1, ...dto });

      await controller.create(dto, mockReq as Request);
      expect(mockDocumentsService.create).toHaveBeenCalledWith(dto, 1);
    });
  });

  describe('update', () => {
    it('should update a document', async () => {
      const dto = { id: 1, title: 'Updated' };
      mockDocumentsService.update.mockResolvedValue({ id: 1, title: 'Updated' });

      await controller.update(dto, mockReq as Request);
      expect(mockDocumentsService.update).toHaveBeenCalledWith(dto, 1);
    });
  });

  describe('delete', () => {
    it('should delete a document', async () => {
      mockDocumentsService.delete.mockResolvedValue({ id: 1 });

      await controller.delete({ id: 1 }, mockReq as Request);
      expect(mockDocumentsService.delete).toHaveBeenCalledWith({ id: 1 }, 1);
    });
  });

  describe('list', () => {
    it('should return paginated document list', async () => {
      const mockList = { total: 1, page: 1, pageSize: 20, items: [] };
      mockDocumentsService.findAllByUser.mockResolvedValue(mockList);

      const result = await controller.list({}, mockReq as Request);
      expect(result.total).toBe(1);
      expect(mockDocumentsService.findAllByUser).toHaveBeenCalledWith({}, 1);
    });
  });

  describe('getVersions', () => {
    it('should return document versions', async () => {
      mockDocumentsService.getVersions.mockResolvedValue([{ id: 1, version: 1 }]);

      const result = await controller.getVersions(1);
      expect(result).toHaveLength(1);
    });
  });

  describe('rollback', () => {
    it('should rollback to a specific version', async () => {
      mockDocumentsService.rollback.mockResolvedValue({ id: 1 });

      await controller.rollback(1, 1, mockReq as Request);
      expect(mockDocumentsService.rollback).toHaveBeenCalledWith(1, 1, 1);
    });
  });

  describe('share', () => {
    it('should share a document with the target user', async () => {
      mockDocumentsService.share.mockResolvedValue({ id: 1 });

      await controller.share(1, { userId: 2, permission: 'viewer' }, mockReq as Request);
      // share(documentId, targetUserId, permission, ownerId)
      expect(mockDocumentsService.share).toHaveBeenCalledWith(1, 2, 'viewer', 1);
    });
  });

  describe('generateShareLink', () => {
    it('should generate share link', async () => {
      mockDocumentsService.generateShareLink.mockResolvedValue({ shareToken: 'abc123' });

      const result = await controller.generateShareLink(1, mockReq as Request);
      expect(result.shareToken).toBe('abc123');
    });
  });

  describe('revokeShare', () => {
    it('should revoke share for a document', async () => {
      mockDocumentsService.revokeShare.mockResolvedValue({ success: true });

      const result = await controller.revokeShare(1, 2, mockReq as Request);
      expect(mockDocumentsService.revokeShare).toHaveBeenCalledWith(1, 2, 1);
    });
  });

  describe('findByShareToken', () => {
    it('should find document by share token', async () => {
      const mockDoc = { id: 1, title: 'Shared', content: {} };
      mockDocumentsService.findByShareToken.mockResolvedValue(mockDoc);

      const result = await controller.findByShareToken('abc123');
      expect(result.title).toBe('Shared');
    });
  });

  describe('getShares', () => {
    it('should return shares for a document', async () => {
      mockDocumentsService.getShares.mockResolvedValue([]);

      await controller.getShares(1, mockReq as Request);
      expect(mockDocumentsService.getShares).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('findSharedWithUser', () => {
    it('should return documents shared with current user', async () => {
      mockDocumentsService.findSharedWithUser.mockResolvedValue([]);

      await controller.findSharedWithUser(mockReq as Request);
      expect(mockDocumentsService.findSharedWithUser).toHaveBeenCalledWith(1);
    });
  });

  describe('search', () => {
    it('should search documents', async () => {
      mockDocumentsService.search.mockResolvedValue([]);

      await controller.search('test', mockReq as Request);
      expect(mockDocumentsService.search).toHaveBeenCalledWith('test', 1);
    });

    it('should handle empty query', async () => {
      mockDocumentsService.search.mockResolvedValue([]);

      await controller.search('', mockReq as Request);
      expect(mockDocumentsService.search).toHaveBeenCalledWith('', 1);
    });
  });

  describe('getTree', () => {
    it('should return folder tree for current user', async () => {
      const tree = [
        { id: 1, title: 'Folder A', isFolder: true, children: [] },
        { id: 2, title: 'Doc', isFolder: false, children: [] },
      ];
      mockDocumentsService.getTree.mockResolvedValue(tree);

      const result = await controller.getTree(mockReq as Request);
      expect(result).toEqual(tree);
      expect(mockDocumentsService.getTree).toHaveBeenCalledWith(1);
    });

    it('should return empty array when no documents', async () => {
      mockDocumentsService.getTree.mockResolvedValue([]);

      const result = await controller.getTree(mockReq as Request);
      expect(result).toHaveLength(0);
    });
  });

  describe('createFolder', () => {
    it('should create a folder at root level', async () => {
      const created = { id: 1, title: 'My Folder', isFolder: true };
      mockDocumentsService.createFolder.mockResolvedValue(created);

      await controller.createFolder({ title: 'My Folder' }, mockReq as Request);
      expect(mockDocumentsService.createFolder).toHaveBeenCalledWith('My Folder', 1, undefined);
    });

    it('should create a folder inside a parent folder', async () => {
      const created = { id: 2, title: 'Sub Folder', isFolder: true, parentId: 1 };
      mockDocumentsService.createFolder.mockResolvedValue(created);

      await controller.createFolder({ title: 'Sub Folder', parentId: 1 }, mockReq as Request);
      expect(mockDocumentsService.createFolder).toHaveBeenCalledWith('Sub Folder', 1, 1);
    });
  });

  describe('moveDocument', () => {
    it('should move document to a target folder', async () => {
      const moved = { id: 2, parentId: 5 };
      mockDocumentsService.moveDocument.mockResolvedValue(moved);

      await controller.moveDocument(2, { parentId: 5 }, mockReq as Request);
      expect(mockDocumentsService.moveDocument).toHaveBeenCalledWith(2, 5, 1);
    });

    it('should move document to root (parentId = null)', async () => {
      const moved = { id: 2, parentId: null };
      mockDocumentsService.moveDocument.mockResolvedValue(moved);

      await controller.moveDocument(2, { parentId: null }, mockReq as Request);
      expect(mockDocumentsService.moveDocument).toHaveBeenCalledWith(2, null, 1);
    });
  });
});
