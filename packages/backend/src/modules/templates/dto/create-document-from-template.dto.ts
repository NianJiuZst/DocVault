import { IsOptional, IsString } from 'class-validator';

export class CreateDocumentFromTemplateDto {
  @IsOptional()
  @IsString()
  title?: string;
}
