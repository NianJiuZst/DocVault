// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { validationSchema } from './config/validation.schema';
import { DocumentsModule } from './modules/documents/documents.module';
import { AuthModule } from './modules/auth/auth.module';
import { CollaborationModule } from './modules/collaboration/collaboration.module';
import { TemplatesModule } from './modules/templates/templates.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
    PrismaModule, // 注册Prisma模块
    DocumentsModule, // 注册Documents模块
    AuthModule, // 注册Auth模块
    CollaborationModule, // 注册协作模块
    TemplatesModule, // 注册模板模块
  ],
})
export class AppModule {}