import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { UsersService } from '../../users/users.service';
import { of } from 'rxjs';

const mockHttpService = {
  post: jest.fn(),
  get: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
  verify: jest.fn(),
};

const mockUsersService = {
  findOrCreate: jest.fn(),
  find: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('getGitHubAccessToken', () => {
    it('should return access token from GitHub', async () => {
      mockHttpService.post.mockReturnValue(
        of({ data: { access_token: 'test_token', token_type: 'bearer' } }),
      );

      const result = await service.getGitHubAccessToken('test_code');
      expect(result.access_token).toBe('test_token');
    });

    it('should handle GitHub error response', async () => {
      mockHttpService.post.mockReturnValue(
        of({ data: { error: 'incorrect_client_credentials' } }),
      );

      const result = await service.getGitHubAccessToken('bad_code');
      expect(result.error).toBe('incorrect_client_credentials');
    });
  });

  describe('getGitHubUserInfo', () => {
    it('should return GitHub user info', async () => {
      const mockUser = {
        id: 123,
        name: 'Test User',
        avatar_url: 'https://example.com/avatar.png',
      };
      mockHttpService.get.mockReturnValue(of({ data: mockUser }));

      const result = await service.getGitHubUserInfo('test_token');
      expect(result.id).toBe(123);
      expect(result.name).toBe('Test User');
    });
  });

  describe('handleGitHubCallback', () => {
    it('should create user and return JWT token', async () => {
      mockHttpService.post.mockReturnValueOnce(
        of({ data: { access_token: 'gh_token' } }),
      );
      mockHttpService.get.mockReturnValueOnce(
        of({ data: { id: 123, name: 'Test User', avatar_url: 'https://example.com/avatar.png' } }),
      );
      mockUsersService.findOrCreate.mockResolvedValue({ id: 1, name: 'Test User', githubUserId: '123' });

      const result = await service.handleGitHubCallback('test_code');

      expect(result.jwtToken).toBe('mock.jwt.token');
      expect(result!.user!.id).toBe(1);
    });

    it('should throw error when GitHub returns no code', async () => {
      mockHttpService.post.mockReturnValue(
        of({ data: { error: 'bad_verification_code' } }),
      );

      await expect(service.handleGitHubCallback('bad_code')).rejects.toThrow(
        'GitHub 令牌获取失败: bad_verification_code',
      );
    });
  });
});
