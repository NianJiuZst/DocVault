import { Injectable} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FindOrCreateUserDto } from './dto/findOrCreate-user.dto';
import { FindOrCreateUserInterface } from './interface/findOrCreate-user.interface';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOrCreate(dto: FindOrCreateUserDto): Promise<FindOrCreateUserInterface|null> {
    let user = await this.prisma.user.findUnique({
      where: { githubUserId: dto.githubUserId },
    });
    if (!user) {
        const newUser = await this.prisma.user.create({
            data: {
                githubUserId:dto.githubUserId,
                name:dto?.name || '',
                avatar:dto?.avatar || '',
            }
        });  
        user = newUser;
    }
    return user;
  }
    
}