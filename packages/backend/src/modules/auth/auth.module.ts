import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';  // 导入用户模块

@Module({
  imports: [
    HttpModule,  // 用于发送 HTTP 请求（调用 GitHub API）
    UsersModule,  // 依赖用户模块
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}