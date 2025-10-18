import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) {}

  // GitHub 回调接口（接收 code 和 state）
  @Get('github/callback')
  async githubCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    try {
      if (!code) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=缺少授权码`);
      }

      // 调用服务处理回调逻辑
      const { jwtToken } = await this.authService.handleGitHubCallback(code);

      // 设置 JWT 到 HttpOnly Cookie
      res.cookie('docvault_jwt', jwtToken, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',  
        sameSite: 'strict',  
        maxAge: 7 * 24 * 60 * 60 * 1000, 
        path: '/',
      });

      return res.redirect(
        `${process.env.FRONTEND_URL}/home/cloud-docs?state=${state}`,
      );
    } catch (err) {
      console.error('GitHub 登录失败:', err);
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=登录失败，请重试`,
      );
    }
  }
}