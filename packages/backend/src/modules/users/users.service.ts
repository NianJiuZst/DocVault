// src/modules/users/users.service.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { FindOrCreateUserDto } from "./dto/findOrCreate-user.dto";
import { FindOrCreateUserInterface } from "./interface/findOrCreate-user.interface";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOrCreate(
    dto: FindOrCreateUserDto
  ): Promise<FindOrCreateUserInterface | null> {
    // ✅ 用 githubUserId 查询（唯一标识）
    let user = await this.prisma.user.findUnique({
      where: { githubUserId: dto.githubUserId },
    });

    if (!user) {
      // ✅ 创建时不要传 id！让数据库自增
      user = await this.prisma.user.create({
        data: {
          githubUserId: dto.githubUserId,
          name: dto.name?.trim() || "Anonymous",
          avatar: dto.avatar || "",
          email: dto.email, // 可为 null
        },
      });
    }

    return user; // Prisma 返回的对象结构与 interface 一致
  }
}
