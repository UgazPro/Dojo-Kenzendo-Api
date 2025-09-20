import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDTO, ResponseLogin } from './auth.dto';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { badResponse, baseResponse } from 'src/utilities/base.dto';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService,
  ) {}

  async login(credentials: LoginDTO) {
    try {
      let findUser = await this.prismaService.users.findFirst({
        where: {
          username: credentials.username,
          password: credentials.password,
        },
        include: {
          rol: true,
          dojo: true,
        },
      });

      if (!findUser) {
        badResponse.message = 'Usuario o contraseña incorrectos';
        return badResponse;
      }

      baseResponse.message = `Bienvenido ${findUser.name} ${findUser.lastName}`;

      let { password, ...user } = findUser;

      const secretKey = this.configService.get<string>('JWT_SECRET_KEY');
      const token = jwt.sign(user, secretKey, { expiresIn: '8h' });

      const responseLogin: ResponseLogin = {
        ...baseResponse,
        token,
      };

      return responseLogin;

    } catch (error) {
      badResponse.message = error.message;
      return badResponse;
    }
  }
}
