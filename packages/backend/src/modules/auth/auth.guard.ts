// src/auth/auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    // 获取当前请求对象
    const request = context.switchToHttp().getRequest<Request>();
    
    // 1. 从Cookie中读取JWT
    const token = request.cookies['docvault_jwt'];
    if (!token) {
      throw new UnauthorizedException('未登录，请先登录');
    }

    // 2. 验证JWT有效性
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET, // 与JwtModule配置的secret一致
      });
      // 3. 将解析后的用户信息附加到request对象（供控制器使用）
      // 假设JWT payload中包含用户id、githubUserId等信息
      request['_user'] = payload; 
    } catch (error) {
      throw new UnauthorizedException('登录已过期，请重新登录');
    }
    return true;
  }
}