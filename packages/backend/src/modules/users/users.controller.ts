import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { FindOrCreateUserDto } from './dto/findOrCreate-user.dto';
import { FindOrCreateUserInterface } from './interface/findOrCreate-user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('findOrCreate')
  async findOrCreate(@Body() dto: FindOrCreateUserDto): Promise<FindOrCreateUserInterface|null> {
    const user = await this.usersService.findOrCreate(dto);
    return user
  }
}