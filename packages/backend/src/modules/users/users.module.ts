import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module'; // 导入Prisma模块
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [PrismaModule], 
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService], 
})
export class UsersModule {}