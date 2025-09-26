// src/users/users.service.ts
import { Injectable} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FindDocumentDto } from './dto/find-document.dto';
import { Document } from '@prisma/client';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async find(dto: FindDocumentDto): Promise<Document|null> {
    let document = await this.prisma.document.findUnique({
      where: { id: dto.id },
    });
    return document ? document : null;
  }
    
}