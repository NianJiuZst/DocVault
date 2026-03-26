import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { AuthGuard } from '../../auth/auth.guard';

const mockUsersService = {
  find: jest.fn(),
  findByGithubId: jest.fn(),
  create: jest.fn(),
  findOrCreate: jest.fn(),
  update: jest.fn(),
} as any;

class MockAuthGuard {
  canActivate() {
    return true;
  }
}

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    })
      .overrideGuard(AuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  // ──────────────────────────────────────────────
  // findOrCreate
  // ──────────────────────────────────────────────
  describe('findOrCreate', () => {
    it('should call usersService.findOrCreate with correct dto', async () => {
      const dto = { id: 123, githubUserId: '123', name: 'Test User', avatar: 'http://example.com/avatar.png' };
      const createdUser = { id: 1, githubUserId: '123', name: 'Test User', avatar: 'http://example.com/avatar.png' };
      mockUsersService.findOrCreate.mockResolvedValue(createdUser);
      const result = await controller.findOrCreate(dto);
      expect(mockUsersService.findOrCreate).toHaveBeenCalledWith(dto);
      expect(result).toEqual(createdUser);
    });

    it('should return null when findOrCreate returns null', async () => {
      mockUsersService.findOrCreate.mockResolvedValue(null);
      const dto = { id: 123, githubUserId: '123' };
      const result = await controller.findOrCreate(dto);
      expect(result).toBeNull();
    });
  });

  // ──────────────────────────────────────────────
  // me
  // ──────────────────────────────────────────────
  describe('me', () => {
    it('should return user info for authenticated request', async () => {
      const mockUser = { id: 1, name: 'Test User', githubUserId: '123' };
      mockUsersService.find.mockResolvedValue(mockUser);
      const mockReq = { _user: { userId: 1 } } as any;
      const result = await controller.me(mockReq);
      expect(mockUsersService.find).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it('should return null when usersService.find throws', async () => {
      mockUsersService.find.mockRejectedValue(new Error('Not found'));
      const mockReq = { _user: { userId: 1 } } as any;
      const result = await controller.me(mockReq);
      expect(result).toBeNull();
    });
  });
});
