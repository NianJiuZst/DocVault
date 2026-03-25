import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../users/users.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock.token'),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('findOrCreate', () => {
    const dto = {
      githubUserId: '123',
      id: 123,
      name: 'Test User',
      avatar: 'https://example.com/avatar.png',
    };

    it('should create new user if not exists', async () => {
      const newUser = { id: 1, githubUserId: '123', name: 'Test User', avatar: 'https://example.com/avatar.png' };
      mockPrisma.user.upsert.mockResolvedValue(newUser);

      const result = await service.findOrCreate(dto);

      expect(result!.id).toBe(1);
      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: { githubUserId: '123' },
        update: { name: 'Test User', avatar: 'https://example.com/avatar.png' },
        create: { githubUserId: '123', name: 'Test User', avatar: 'https://example.com/avatar.png' },
      });
    });

    it('should update existing user', async () => {
      const existingUser = { id: 1, githubUserId: '123', name: 'Old Name', avatar: 'old.png' };
      mockPrisma.user.upsert.mockResolvedValue({ ...existingUser, name: 'Test User' });

      await service.findOrCreate(dto);

      expect(mockPrisma.user.upsert).toHaveBeenCalled();
    });
  });

  describe('find', () => {
    it('should return user by id', async () => {
      const user = { id: 1, githubUserId: '123', name: 'Test', avatar: 'url' };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await service.find(1);

      expect(result!.id).toBe(1);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return empty object when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.find(999);

      expect(result).toEqual({
        id: 0,
        githubUserId: '',
        name: '',
        avatar: '',
      });
    });
  });
});
