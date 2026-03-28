import { Controller, Get, Post, Query, Req, Res, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  /**
   * E2E Test Login Bypass — ONLY works when NODE_ENV=test or E2E_MODE=true
   * Signs a real JWT so downstream guards pass normally.
   */
  @Get('e2e-login')
  async e2eLogin(@Query('userId') userId: string, @Res({ passthrough: true }) res: Response) {
    if (process.env.NODE_ENV !== 'test' && process.env.E2E_MODE !== 'true') {
      throw new ForbiddenException('E2E login only available in test mode');
    }
    const user = await this.prisma.user.findUnique({ where: { id: parseInt(userId, 10) } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const token = this.jwtService.sign({ userId: user.id });
    res.cookie('docvault_jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600000,
    });
    return { user: { id: user.id, name: user.name, githubUserId: user.githubUserId } };
  }

  /**
   * E2E Test GitHub Callback Bypass — ONLY works when NODE_ENV=test or E2E_MODE=true
   * When code='e2e-test-token', skips real OAuth and creates/uses a test user.
   */
  @Get('github/callback')
  async githubCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const isE2E = process.env.NODE_ENV === 'test' || process.env.E2E_MODE === 'true';
    if (isE2E && code === 'e2e-test-token') {
      let user = await this.prisma.user.findFirst({ where: { githubUserId: 'e2e-test' } });
      if (!user) {
        user = await this.prisma.user.create({
          data: { name: 'e2e-test', githubUserId: 'e2e-test', avatar: '' },
        });
      }
      const token = this.jwtService.sign({ userId: user.id });
      res.cookie('docvault_jwt', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 3600000,
      });
      return res.redirect((process.env.FRONTEND_URL || 'http://localhost:3000') + '/home/cloud-docs');
    }

    // Normal OAuth flow below
    try {
      const expectedState = req.cookies['github_oauth_state'];
      this.clearOAuthStateCookie(res);

      if (!state || !expectedState || state !== expectedState) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=OAuthStateMismatch`);
      }

      if (!code) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=CallbackRouteError`);
      }

      const { jwtToken } = await this.authService.handleGitHubCallback(code);

      // 设置 JWT 到 HttpOnly Cookie（使用 lax 以支持 OAuth 跨站重定向后的 cookie 传递）
      res.cookie('docvault_jwt', jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      return res.redirect(`${process.env.FRONTEND_URL}/home/cloud-docs`);
    } catch (err) {
      console.error('GitHub 登录失败:', err);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=OAuthCallback`);
    }
  }

  private clearOAuthStateCookie(res: Response) {
    res.cookie('github_oauth_state', '', {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: any) {
    res.cookie('docvault_jwt', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    res.status(200);
    return { message: 'Logged out successfully' };
  }

  @Get('token')
  async getToken(@Req() req: any, @Res({ passthrough: true }) res: any) {
    const token = req.cookies?.['docvault_jwt'] ?? null;
    return { token };
  }
}
