import { Injectable} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FindOrCreateUserDto } from './dto/findOrCreate-user.dto';
import { FindOrCreateUserInterface } from './interface/findOrCreate-user.interface';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOrCreate(dto: FindOrCreateUserDto): Promise<FindOrCreateUserInterface|null> {
    let user = await this.prisma.user.findUnique({
      where: { id: dto.id },
    });
    if (!user) {
        const newUser = await this.prisma.user.create({
            data: {
                id:dto.id,
                githubUserId:dto.githubUserId,
                name:dto.name ? dto.name : '',
                avatar:'',
            }
        });  
        user = newUser;
    }
    return user;
  }
    
}