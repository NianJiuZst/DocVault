import { Injectable} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FindOrCreateUserDto } from './dto/findOrCreate-user.dto';
import { FindOrCreateUserInterface } from './interface/findOrCreate-user.interface';
import { MeInterface } from './interface/me.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService,private jwtService: JwtService) {}

  async findOrCreate(dto: FindOrCreateUserDto): Promise<FindOrCreateUserInterface|null> {
    const user = await this.prisma.user.upsert({
      // 1. 查找条件：根据 githubUserId 匹配
      where: {
        githubUserId: dto.githubUserId, 
      },
      // 2. 若存在：更新字段
      update: {
        name: dto?.name || '', 
        avatar: dto?.avatar || '', 
      },
      // 3. 若不存在：创建新用户（和原来的 create 逻辑一致）
      create: {
        githubUserId: dto.githubUserId,
        name: dto?.name || '',
        avatar: dto?.avatar || '',
      },
    });
    return user;
  }
  async find(userId: number): Promise<MeInterface|null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return {
        id: 0,
        githubUserId: '',
        name: '',
        avatar: '',
      };
    }
    return {
      id: user.id,
      githubUserId: user.githubUserId,
      name: user.name,
      avatar: user.avatar,
    }
  }
    
}