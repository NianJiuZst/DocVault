import { IsOptional, IsNumber} from 'class-validator';

export class FindDocumentDto {
  @IsNumber()
  id: number;
  @IsOptional()
  author?: string;
  @IsOptional()
  content: string;
}