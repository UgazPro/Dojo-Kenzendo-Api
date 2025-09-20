import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MartialRanksModule } from './martial-ranks/martial-ranks.module';

@Module({
  imports: [AuthModule, UsersModule, MartialRanksModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
