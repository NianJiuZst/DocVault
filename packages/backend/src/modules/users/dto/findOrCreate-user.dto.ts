import { IsOptional, IsNumber } from "class-validator";

export class FindOrCreateUserDto {
  @IsNumber()
  id: number;
  @IsOptional()
  name?: string;
  githubUserId: string;
  email?: string | null;
  avatar?: string;
}
