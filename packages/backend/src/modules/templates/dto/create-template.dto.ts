import { IsString, IsBoolean, IsOptional, IsObject } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsObject()
  content: object;

  @IsString()
  category: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
