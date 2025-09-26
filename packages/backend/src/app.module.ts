// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module'; 
import { validationSchema } from './config/validation.schema';
import { DocumentsModule } from './modules/documents/documents.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
    PrismaModule, // 注册Prisma模块
    DocumentsModule, // 注册Documents模块
  ],
})
export class AppModule {}