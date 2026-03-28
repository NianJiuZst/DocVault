import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { CreateDocumentFromTemplateDto } from './dto/create-document-from-template.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll(@Req() req: Request) {
    const userId = (req as any)._user.userId;
    return this.templatesService.findAll(userId);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() dto: CreateTemplateDto, @Req() req: Request) {
    const userId = (req as any)._user.userId;
    return this.templatesService.create(dto, userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async delete(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const userId = (req as any)._user.userId;
    return this.templatesService.delete(id, userId);
  }

  @Post(':id/create-document')
  @UseGuards(AuthGuard)
  async createDocument(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateDocumentFromTemplateDto,
    @Req() req: Request,
  ) {
    const userId = (req as any)._user.userId;
    return this.templatesService.createDocumentFromTemplate(id, dto.title, userId);
  }
}
