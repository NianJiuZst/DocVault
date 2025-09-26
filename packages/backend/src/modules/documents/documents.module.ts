// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module'; // 导入Prisma模块
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';

@Module({
  imports: [PrismaModule], 
  providers: [DocumentsService],
  controllers: [DocumentsController],
  exports: [DocumentsService], 
})
export class DocumentsModule {}