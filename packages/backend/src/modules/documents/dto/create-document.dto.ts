import { IsString, IsOptional, IsNumber, IsObject } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsObject()
  content?: object;
}
