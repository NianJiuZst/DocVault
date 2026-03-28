import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import { Response } from 'express';

const originalFrontendUrl = process.env.FRONTEND_URL;
process.env.FRONTEND_URL ??= 'http://localhost:3000';

const mockAuthService = {
  handleGitHubCallback: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
  },
};

describe('AuthController', () => {
  let controller: AuthController;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();
    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  afterAll(() => {
    if (originalFrontendUrl === undefined) {
      delete process.env.FRONTEND_URL;
    } else {
      process.env.FRONTEND_URL = originalFrontendUrl;
    }
  });

  // ──────────────────────────────────────────────
  // githubCallback
  // ──────────────────────────────────────────────
  describe('githubCallback', () => {
    const mockRedirect = jest.fn();
    const mockRes = {
      redirect: mockRedirect,
      cookie: jest.fn(),
    } as unknown as Response;
    const mockReq = {
      cookies: {
        github_oauth_state: 'some-state',
      },
    } as any;

    it('should redirect to login with error when code is missing', async () => {
      await controller.githubCallback('', 'some-state', mockReq, mockRes);
      expect(mockRedirect).toHaveBeenCalledWith(
        'http://localhost:3000/login?error=CallbackRouteError',
      );
    });

    it('should redirect to login when state is missing or mismatched', async () => {
      await controller.githubCallback('valid-code', 'bad-state', mockReq, mockRes);
      expect(mockAuthService.handleGitHubCallback).not.toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalledWith(
        'http://localhost:3000/login?error=OAuthStateMismatch',
      );
    });

    it('should redirect to cloud-docs when code and state are valid', async () => {
      mockAuthService.handleGitHubCallback.mockResolvedValue({ jwtToken: 'test-jwt-token' });
      await controller.githubCallback('valid-code', 'some-state', mockReq, mockRes);
      expect(mockAuthService.handleGitHubCallback).toHaveBeenCalledWith('valid-code');
      expect(mockRes.cookie).toHaveBeenNthCalledWith(
        1,
        'github_oauth_state',
        '',
        expect.objectContaining({ sameSite: 'lax', maxAge: 0 }),
      );
      expect(mockRes.cookie).toHaveBeenNthCalledWith(
        2,
        'docvault_jwt',
        'test-jwt-token',
        expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
      );
      expect(mockRedirect).toHaveBeenCalledWith(
        'http://localhost:3000/home/cloud-docs',
      );
    });

    it('should redirect to login with error when handleGitHubCallback throws', async () => {
      mockAuthService.handleGitHubCallback.mockRejectedValue(new Error('OAuth failed'));
      await controller.githubCallback('valid-code', 'some-state', mockReq, mockRes);
      expect(mockRedirect).toHaveBeenCalledWith(
        'http://localhost:3000/login?error=OAuthCallback',
      );
    });
  });

  // ──────────────────────────────────────────────
  // logout
  // ──────────────────────────────────────────────
  describe('logout', () => {
    it('should clear JWT cookie and return success message', async () => {
      const mockJson = jest.fn();
      const mockRes = {
        cookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: mockJson,
      } as any;
      await controller.logout(mockRes);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'docvault_jwt',
        '',
        expect.objectContaining({ httpOnly: true, maxAge: 0 }),
      );
      expect(mockJson).toHaveBeenCalledWith({ message: 'Logged out successfully' });
    });
  });

  // ──────────────────────────────────────────────
  // getToken
  // ──────────────────────────────────────────────
  describe('getToken', () => {
    it('should return token from cookie when present', async () => {
      const mockJson = jest.fn();
      const mockRes = { json: mockJson };
      const mockReq = { cookies: { docvault_jwt: 'my-token' } } as any;
      await controller.getToken(mockReq, mockRes);
      expect(mockJson).toHaveBeenCalledWith({ token: 'my-token' });
    });

    it('should return null token when cookie is missing', async () => {
      const mockJson = jest.fn();
      const mockRes = { json: mockJson };
      const mockReq = { cookies: {} } as any;
      await controller.getToken(mockReq, mockRes);
      expect(mockJson).toHaveBeenCalledWith({ token: null });
    });
  });
});
