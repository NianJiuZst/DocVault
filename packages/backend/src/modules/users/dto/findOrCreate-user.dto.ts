import { IsOptional, IsNumber } from "class-validator";

export class FindOrCreateUserDto {
  @IsNumber()
  id: number;
  githubUserId: string;
  @IsOptional()
  name?: string;
  githubUserId: string;
  email?: string | null;
  avatar?: string;
}

