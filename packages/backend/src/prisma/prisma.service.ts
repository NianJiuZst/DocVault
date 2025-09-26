// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy{
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Prisma connected successfully.');
    } catch (error) {
      console.error('Prisma connection failed:', error);
      throw error;
    }
  }
  async onModuleDestroy() {
    try {
      await this.$disconnect();
      console.log('Prisma disconnected successfully.');
    } catch (error) {
      console.error('Prisma disconnection failed:', error);
      throw error;
    }
  }
}