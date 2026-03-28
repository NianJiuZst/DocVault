import { IsNumber } from 'class-validator';
import { ParseIntPipe } from '@nestjs/common';

export class DeleteTemplateDto {
  @IsNumber()
  id: number;
}
