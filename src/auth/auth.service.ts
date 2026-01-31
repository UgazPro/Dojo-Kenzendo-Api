import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleAuthDTO, LoginDTO, ResponseLogin } from './auth.dto';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { badResponse, baseResponse } from '../utilities/base.dto';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  // Inicializamos el cliente de Google con el ID del proyecto
  private googleClient: OAuth2Client;
  private secretKey: string;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(this.configService.get<string>('GOOGLE_CLIENT_ID'));
    this.secretKey = this.configService.get<string>('JWT_SECRET_KEY') as string;
  }

  async authenticateWithGoogle(idToken: string) {
    try {
      // 1. Validar el token con los servidores de Google
      const ticket = await this.googleClient.verifyIdToken({
        idToken: idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
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
            password: await bcrypt.hash(googleId as string, 12), // contraseña temporal con hash
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

      const token = jwt.sign(user, this.secretKey, { expiresIn: '7d' });

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
        },
        include: {
          rol: true,
          dojo: {
            select: {
              id: true,
              dojo: true,
              code: true,
            }
          },
        },
      });

      if (!findUser) {
        badResponse.message = 'Usuario o contraseña incorrectos';
        return badResponse;
      }

      const isValid = await bcrypt.compare(credentials.password, findUser.password);
      if (!isValid) {
        badResponse.message = 'Usuario o contraseña incorrectos';
        return badResponse;
      }

      baseResponse.message = `Bienvenido ${findUser.name} ${findUser.lastName}`;

      let { password, ...user } = findUser;

      const token = jwt.sign(user, this.secretKey, { expiresIn: '7d' });

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
