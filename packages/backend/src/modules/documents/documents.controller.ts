// src/users/users.controller.ts
import { Controller, Post, Body,Get } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { FindDocumentDto } from './dto/find-document.dto';
import { FindDocumentsInterface } from './interfaces/find-documents.interface';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('find')
  async find(@Body() dto: FindDocumentDto): Promise<FindDocumentsInterface> {
    const document = await this.documentsService.find(dto);
    return {
      id: document ? document.id : null,
      title: document ? document.title : '没找到',
    };
  }
}