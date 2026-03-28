import {
  BadRequestException,
  Controller,
  Post,
  Get,
  Delete,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto, DeleteDocumentDto, ListDocumentDto } from './dto/update-document.dto';
import { ImportDocumentDto } from './dto/import-document.dto';
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

  @Get(':id/versions')
  @UseGuards(AuthGuard)
  async getVersions(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const userId = (req as any)._user.userId;
    return this.documentsService.getVersions(id, userId);
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

  @Post(':id/share')
  @UseGuards(AuthGuard)
  async share(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { userId: number; permission?: 'viewer' | 'editor'; role?: 'viewer' | 'editor' },
    @Req() req: Request,
  ) {
    const userId = (req as any)._user.userId;
    const permission = body.permission ?? body.role;
    if (!permission) {
      throw new BadRequestException('Missing share permission');
    }
    return this.documentsService.share(id, body.userId, permission, userId);
  }

  @Delete(':id/share/:targetUserId')
  @UseGuards(AuthGuard)
  async revokeShare(
    @Param('id', ParseIntPipe) id: number,
    @Param('targetUserId', ParseIntPipe) targetUserId: number,
    @Req() req: Request,
  ) {
    const userId = (req as any)._user.userId;
    return this.documentsService.revokeShare(id, targetUserId, userId);
  }

  @Get(':id/shares')
  @UseGuards(AuthGuard)
  async getShares(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const userId = (req as any)._user.userId;
    return this.documentsService.getShares(id, userId);
  }

  @Get(':id/shared')
  @UseGuards(AuthGuard)
  async getShared(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const userId = (req as any)._user.userId;
    return this.documentsService.getShares(id, userId);
  }

  @Post(':id/share-link')
  @UseGuards(AuthGuard)
  async generateShareLink(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const userId = (req as any)._user.userId;
    return this.documentsService.generateShareLink(id, userId);
  }

  @Post(':id/public')
  @UseGuards(AuthGuard)
  async enablePublic(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const userId = (req as any)._user.userId;
    return this.documentsService.generateShareLink(id, userId);
  }

  @Delete(':id/public')
  @UseGuards(AuthGuard)
  async disablePublic(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const userId = (req as any)._user.userId;
    return this.documentsService.disableShareLink(id, userId);
  }

  @Get('shared/:token')
  async findByShareToken(@Param('token') token: string) {
    return this.documentsService.findByShareToken(token);
  }

  @Get('shared')
  @UseGuards(AuthGuard)
  async findSharedWithUser(@Req() req: Request) {
    const userId = (req as any)._user.userId;
    return this.documentsService.findSharedWithUser(userId);
  }

  @Get('search')
  @UseGuards(AuthGuard)
  async search(@Query('q') q: string, @Req() req: Request) {
    const userId = (req as any)._user.userId;
    return this.documentsService.search(q ?? '', userId);
  }

  // ── Folder operations ──────────────────────────────────────────

  @Get('tree')
  @UseGuards(AuthGuard)
  async getTree(@Req() req: Request) {
    const userId = (req as any)._user.userId;
    return this.documentsService.getTree(userId);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async find(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const userId = (req as any)._user.userId;
    return this.documentsService.find(id, userId);
  }

  @Post('folder')
  @UseGuards(AuthGuard)
  async createFolder(
    @Body() body: { title: string; parentId?: number },
    @Req() req: Request,
  ) {
    const userId = (req as any)._user.userId;
    return this.documentsService.createFolder(body.title, userId, body.parentId);
  }

  @Put(':id/move')
  @UseGuards(AuthGuard)
  async moveDocument(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { parentId: number | null },
    @Req() req: Request,
  ) {
    const userId = (req as any)._user.userId;
    return this.documentsService.moveDocument(id, body.parentId, userId);
  }

  // ── Export / Import ──────────────────────────────────────────

  @Get(':id/export/markdown')
  @UseGuards(AuthGuard)
  async exportMarkdown(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const userId = (req as any)._user.userId;
    return this.documentsService.exportAsMarkdown(id, userId);
  }

  @Post('import/markdown')
  @UseGuards(AuthGuard)
  async importMarkdown(
    @Body() dto: ImportDocumentDto,
    @Req() req: Request,
  ) {
    const userId = (req as any)._user.userId;
    return this.documentsService.importFromMarkdown(dto.title, dto.content, userId, dto.parentId);
  }

  @Get(':id/export/pdf')
  @UseGuards(AuthGuard)
  async exportPdf(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userId = (req as any)._user.userId;
    const pdfBuffer = await this.documentsService.exportAsPdf(id, userId);

    // Get document title for filename
    const doc = await this.documentsService.find(id, userId);
    const filename = doc
      ? `${doc.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.pdf`
      : 'document.pdf';

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }
}
