import { IsString, IsOptional, IsNumber, IsObject } from 'class-validator';

export class UpdateDocumentDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsObject()
  content?: object;
}

export class DeleteDocumentDto {
  @IsNumber()
  id: number;
}

export class ListDocumentDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  pageSize?: number;
}
