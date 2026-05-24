import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { AllExceptionsFilter } from './filters/exception.filter';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './guards/auth/auth.guard';
import { RolesGuard } from './guards/roles/roles.guard';
import { join } from 'path';
import * as express from 'express';

function collectValidationMessages(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => {
    const constraints = Object.values(error.constraints ?? {});
    const childConstraints = collectValidationMessages(error.children ?? []);

    return [...constraints, ...childConstraints];
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalGuards(new AuthGuard(app.get(JwtService)), new RolesGuard(app.get(Reflector)))
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) => {
      const message = collectValidationMessages(errors).join('; ');

      return new BadRequestException(`Errores de validación: ${message}`);
    },
  }));
  app.enableCors();
  // app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads/' });
  app.use('/api/uploads', express.static(join(process.cwd(), 'uploads')));
  app.setGlobalPrefix('/api');
  await app.listen(3000);
}
bootstrap();
