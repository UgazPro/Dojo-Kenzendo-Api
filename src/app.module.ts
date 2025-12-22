import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MartialRanksModule } from './martial-ranks/martial-ranks.module';
import { MainLoadModule } from './main-load/main-load.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AuthModule, 
    UsersModule, 
    MartialRanksModule, 
    MainLoadModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'], // primero busca en .env.local
    }),

  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule { }
