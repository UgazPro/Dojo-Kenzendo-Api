import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './filters/exception.filter';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './guards/auth/auth.guard';
import { RolesGuard } from './guards/roles/roles.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useGlobalGuards(new AuthGuard(app.get(JwtService)), new RolesGuard(app.get(Reflector)))
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) => {
      const message = errors
        .map(
          (error) =>
            `${Object.values(error.constraints ?? {}).join(', ')}`
        )
        .join('; ');

      return new BadRequestException(`Errores de validación: ${message}`);
    },
  }));
  app.enableCors();
  app.setGlobalPrefix('/api');
  await app.listen(3000);
}
bootstrap();
