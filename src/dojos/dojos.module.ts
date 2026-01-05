import { Module } from '@nestjs/common';
import { DojosController } from './dojos.controller';
import { DojosService } from './dojos.service';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  controllers: [DojosController],
  providers: [DojosService, PrismaService]
})
export class DojosModule {}
