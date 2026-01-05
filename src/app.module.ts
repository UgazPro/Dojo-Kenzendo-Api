import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MainLoadModule } from './main-load/main-load.module';
import { ConfigModule } from '@nestjs/config';
import { OrganizationModule } from './organization/organization.module';
import { DojosModule } from './dojos/dojos.module';
import { ActivitiesModule } from './activities/activities.module';

@Module({
  imports: [
    AuthModule, 
    UsersModule, 
    MainLoadModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'], // primero busca en .env.local
    }),
    OrganizationModule,
    DojosModule,
    ActivitiesModule,

  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule { }
