import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto, DeleteDocumentDto, ListDocumentDto } from './dto/update-document.dto';
import { AuthGuard } from '../auth/auth.guard';
import { DocumentListResponse } from './interfaces/document-info.interface';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('create')
  @UseGuards(AuthGuard)
  async create(@Body() dto: CreateDocumentDto, @Req() req: Request) {
    const userId = (req as any)._user.userId;
    return this.documentsService.create(dto, userId);
  }

  @Post('update')
  @UseGuards(AuthGuard)
  async update(@Body() dto: UpdateDocumentDto, @Req() req: Request) {
    const userId = (req as any)._user.userId;
    return this.documentsService.update(dto, userId);
  }

  @Post('delete')
  @UseGuards(AuthGuard)
  async delete(@Body() dto: DeleteDocumentDto, @Req() req: Request) {
    const userId = (req as any)._user.userId;
    return this.documentsService.delete(dto, userId);
  }

  @Get('list')
  @UseGuards(AuthGuard)
  async list(@Query() dto: ListDocumentDto, @Req() req: Request): Promise<DocumentListResponse> {
    const userId = (req as any)._user.userId;
    return this.documentsService.findAllByUser(dto, userId);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async find(@Param('id', ParseIntPipe) id: number) {
    return this.documentsService.find(id);
  }

  @Get(':id/versions')
  @UseGuards(AuthGuard)
  async getVersions(@Param('id', ParseIntPipe) id: number) {
    return this.documentsService.getVersions(id);
  }

  @Post(':id/rollback')
  @UseGuards(AuthGuard)
  async rollback(
    @Param('id', ParseIntPipe) id: number,
    @Body('versionId', ParseIntPipe) versionId: number,
    @Req() req: Request,
  ) {
    const userId = (req as any)._user.userId;
    return this.documentsService.rollback(id, versionId, userId);
  }
}
