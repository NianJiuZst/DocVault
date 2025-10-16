import { Injectable} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FindOrCreateUserDto } from './dto/findOrCreate-user.dto';
import { FindOrCreateUserInterface } from './interface/findOrCreate-user.interface';
import { MeInterface } from './interface/me.interface';

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
  async find(userId: number): Promise<MeInterface|null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      githubUserId: user.githubUserId,
      name: user.name,
      avatar: user.avatar,
    }
  }
    
}