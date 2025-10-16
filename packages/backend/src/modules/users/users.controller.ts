import { Controller, Post, Body,Req,Request} from '@nestjs/common';
import { UsersService } from './users.service';
import { FindOrCreateUserDto } from './dto/findOrCreate-user.dto';
import { FindOrCreateUserInterface } from './interface/findOrCreate-user.interface';
import { MeInterface } from './interface/me.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('findOrCreate')
  async findOrCreate(@Body() dto: FindOrCreateUserDto): Promise<FindOrCreateUserInterface|null> {
    const user = await this.usersService.findOrCreate(dto);
    return user
  }
  @Post('me')
  async me(@Req() req: Request): Promise<MeInterface|null> {
    const user = req['_user'];
    try{
      const me = await this.usersService.find(user.userId);
      return me;
    }catch(err){
      return null;
    }
  }
}