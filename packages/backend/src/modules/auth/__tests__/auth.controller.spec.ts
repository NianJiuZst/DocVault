import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { Response } from 'express';

const mockAuthService = {
  handleGitHubCallback: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();
    controller = module.get<AuthController>(AuthController);
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

    it('should redirect to login with error when code is missing', async () => {
      await controller.githubCallback('', 'state', mockRes);
      expect(mockRedirect).toHaveBeenCalledWith(
        'http://localhost:3000/login?error=缺少授权码',
      );
    });

    it('should redirect to cloud-docs with state when code is valid', async () => {
      mockAuthService.handleGitHubCallback.mockResolvedValue({ jwtToken: 'test-jwt-token' });
      await controller.githubCallback('valid-code', 'some-state', mockRes);
      expect(mockAuthService.handleGitHubCallback).toHaveBeenCalledWith('valid-code');
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'docvault_jwt',
        'test-jwt-token',
        expect.objectContaining({ httpOnly: true, sameSite: 'strict' }),
      );
      expect(mockRedirect).toHaveBeenCalledWith(
        'http://localhost:3000/home/cloud-docs?state=some-state',
      );
    });

    it('should redirect to login with error when handleGitHubCallback throws', async () => {
      mockAuthService.handleGitHubCallback.mockRejectedValue(new Error('OAuth failed'));
      await controller.githubCallback('valid-code', 'some-state', mockRes);
      expect(mockRedirect).toHaveBeenCalledWith(
        'http://localhost:3000/login?error=登录失败，请重试',
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
