import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@/generated/prisma/client';

// Versión simplificada (recomendada para servidores tradicionales)
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}