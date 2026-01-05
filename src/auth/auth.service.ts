import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleAuthDTO, LoginDTO, ResponseLogin } from './auth.dto';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { badResponse, baseResponse } from '../utilities/base.dto';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) { }

  // Inicializamos el cliente de Google con el ID del proyecto
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  async authenticateWithGoogle(idToken: string) {
    try {
      // 1. Validar el token con los servidores de Google
      const ticket = await this.googleClient.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload(); // Aquí viene la info del usuario
      if (!payload) throw new UnauthorizedException();

      const { email, name, picture, sub: googleId } = payload;

      let findUser = await this.prismaService.users.findFirst({
        where: { email },
      });

      const roleId = await this.prismaService.roles.findFirst({
        where: { rol: 'Estudiante' },
      })

      if (!findUser) {
        findUser = await this.prismaService.users.create({
          data: {
            email: email as string,
            name: name as string,
            lastName: '',
            username: name as string,
            password: googleId, // Usamos el Google ID como contraseña temporal
            profileImg: picture as string,

            //Datos a solicitar posteriormente
            identification: '',
            address: '',
            phone: '',
            birthday: new Date('2000-01-01'),
            dojoId: 1,
            enrollmentDate: new Date(),
            //


            deleted: false,
            active: true,
            rolId: roleId?.id as number,
          },
        });
      }

      let { password, ...user } = findUser;

      const secretKey = this.configService.get<string>('JWT_SECRET_KEY');
      const token = jwt.sign(user, secretKey, { expiresIn: '8h' });

      const responseLogin: ResponseLogin = {
        ...baseResponse,
        token,
      };

      return responseLogin;

    } catch (error) {
      throw new UnauthorizedException('Token de Google no válido o expirado');
    }
  }

  async updateGoogleAuth(id: number, userData: GoogleAuthDTO) {
    try {
      await this.prismaService.users.update({
        where: { id },
        data: {
          identification: userData.identification,
          address: userData.address,
          phone: userData.phone,
          birthday: userData.birthday,
          rolId: userData.rolId,
          dojoId: userData.dojoId,
          enrollmentDate: userData.enrollmentDate,
        },
      });
    } catch (error) {
      throw new UnauthorizedException('No se pudo actualizar el usuario');
    }
  }

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
