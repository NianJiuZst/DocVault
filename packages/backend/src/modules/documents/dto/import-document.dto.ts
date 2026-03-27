import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class ImportDocumentDto {
  @IsString()
  title: string;

  @IsString()
  content: string; // Markdown content

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  parentId?: number;
}
