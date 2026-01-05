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
import { PaymentsModule } from './payments/payments.module';
import { JwtService } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth/auth.guard';
import { RolesGuard } from './guards/roles/roles.guard';

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
    PaymentsModule,

  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,

    //Validacion de JWT
    // JwtService,

    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard, // se ejecuta primero
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard, // se ejecuta después, depende del user ya autenticado
    // },
  ],
})
export class AppModule { }
