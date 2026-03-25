import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockJwtService: Partial<JwtService>;

  beforeEach(() => {
    mockJwtService = {
      verify: jest.fn() as any,
    };
    guard = new AuthGuard(mockJwtService as JwtService);
  });

  const createMockContext = (cookie: string | null): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ cookies: { docvault_jwt: cookie } }),
      }),
    } as ExecutionContext;
  };

  it('should allow request with valid token', () => {
    (mockJwtService.verify as jest.Mock).mockReturnValue({ userId: 1 });
    const context = createMockContext('valid.jwt.token');

    expect(guard.canActivate(context)).toBe(true);
    expect(mockJwtService.verify).toHaveBeenCalledWith('valid.jwt.token', { secret: undefined });
  });

  it('should throw error when no token in cookie', () => {
    const context = createMockContext(null);

    expect(() => guard.canActivate(context)).toThrow('未登录，请先登录');
  });

  it('should throw error when token is expired or invalid', () => {
    (mockJwtService.verify as jest.Mock).mockImplementation(() => {
      throw new Error('jwt expired');
    });
    const context = createMockContext('expired.token');

    expect(() => guard.canActivate(context)).toThrow('登录已过期，请重新登录');
  });
});
