import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module'; // 导入Prisma模块
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule,JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
      }),
    }),], 
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService], 
})
export class UsersModule {}