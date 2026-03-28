import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number) {
    return this.prisma.template.findMany({
      where: {
        OR: [{ ownerId: userId }, { isPublic: true }],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateTemplateDto, userId: number) {
    return this.prisma.template.create({
      data: {
        name: dto.name,
        content: dto.content as Prisma.InputJsonValue,
        category: dto.category,
        isPublic: dto.isPublic ?? false,
        ownerId: userId,
      },
    });
  }

  async delete(id: number, userId: number) {
    const template = await this.prisma.template.findUnique({ where: { id } });
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    if (template.ownerId !== userId) {
      throw new ForbiddenException('You do not own this template');
    }
    return this.prisma.template.delete({ where: { id } });
  }

  async createDocumentFromTemplate(
    templateId: number,
    title: string | undefined,
    userId: number,
  ) {
    const template = await this.prisma.template.findUnique({
      where: { id: templateId },
    });
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Use template name as title if not provided
    const documentTitle = title ?? template.name;

    return this.prisma.document.create({
      data: {
        title: documentTitle,
        content: template.content as Prisma.InputJsonValue,
        userId,
      },
    });
  }
}
