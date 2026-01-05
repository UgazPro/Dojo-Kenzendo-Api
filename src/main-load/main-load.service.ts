import { PrismaService } from '@/prisma/prisma.service';
import { DtoBaseResponse } from '@/utilities/base.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MainLoadService {

    constructor(private readonly prismaService: PrismaService) {

    }

    async loadInitialData(): Promise<DtoBaseResponse> {
        await this.prismaService.martialArts.createMany({
            data: [
                { martialArt: 'Karate', icon: 'karate-icono.png' },
                { martialArt: 'Kobudo', icon: 'kobudo-icono.png' },
                { martialArt: 'Kendo Iaido', icon: 'kendo-iaido-icono.png' },
            ],
        });

        await this.prismaService.roles.createMany({
            data: [
                { rol: 'Administrador', },
                { rol: 'Líder Instructor', },
                { rol: 'Instructor', },
                { rol: 'Estudiante', },
                { rol: 'Representante', },
            ],
        });

        await this.prismaService.ranks.createMany({
            data: [
                { code: 'K10', rank_name: '', belt: 'Blanco', icon: 'white-belt.png', martialArtId: 1 },
                { code: 'K09', rank_name: '', belt: 'Blanco Punta Amarillo', icon: 'white-belt.png', martialArtId: 1 },
                { code: 'K08', rank_name: '', belt: 'Blanco Raya Amarillo', icon: 'white-belt.png', martialArtId: 1 },
                { code: 'K07', rank_name: '', belt: 'Amarillo', icon: 'white-belt.png', martialArtId: 1 },
                { code: 'K06', rank_name: '', belt: 'Naranja', icon: 'white-belt.png', martialArtId: 1 },
                { code: 'K05', rank_name: 'Senpai', belt: 'Verde', icon: 'white-belt.png', martialArtId: 1 },
                { code: 'K04', rank_name: 'Senpai', belt: 'Azul', icon: 'white-belt.png', martialArtId: 1 },
                { code: 'K03', rank_name: 'Sendoin', belt: 'Marron', icon: 'white-belt.png', martialArtId: 1 },
                { code: 'K02', rank_name: 'Sendoin', belt: 'Marron Punta Negra', icon: 'white-belt.png', martialArtId: 1 },
                { code: 'K01', rank_name: 'Sendoin', belt: 'Marron Raya Negra', icon: 'white-belt.png', martialArtId: 1 },
                { code: 'K00', rank_name: 'Shidoin', belt: 'Negro', icon: 'black-belt.png', martialArtId: 1 },
                { code: 'D01', rank_name: 'Shidoin', belt: 'Negro', icon: 'black-belt.png', martialArtId: 1 },
                { code: 'D02', rank_name: 'Shidoin', belt: 'Negro', icon: 'black-belt.png', martialArtId: 1 },
                { code: 'D03', rank_name: 'Shihandai', belt: 'Negro', icon: 'black-belt.png', martialArtId: 1 },
                { code: 'D04', rank_name: 'Junshihan', belt: 'Negro', icon: 'black-belt.png', martialArtId: 1 },
                { code: 'D05', rank_name: 'Shihan', belt: 'Negro', icon: 'black-belt.png', martialArtId: 1 },
                { code: 'D06', rank_name: 'Renshi', belt: 'Negro', icon: 'black-belt.png', martialArtId: 1 },
                { code: 'D07', rank_name: 'Kyoshi', belt: 'Negro', icon: 'black-belt.png', martialArtId: 1 },

                //Kobudo
                { code: 'K11', rank_name: '', belt: 'Blanco', icon: 'white-belt.png', martialArtId: 2 },
                { code: 'K10', rank_name: '', belt: 'Blanco Punta Amarillo', icon: 'white-belt.png', martialArtId: 2 },
                { code: 'K09', rank_name: '', belt: 'Blanco Raya Amarillo', icon: 'white-belt.png', martialArtId: 2 },
                { code: 'K08', rank_name: '', belt: 'Amarillo', icon: 'white-belt.png', martialArtId: 2 },
                { code: 'K07', rank_name: '', belt: 'Naranja', icon: 'white-belt.png', martialArtId: 2 },
                { code: 'K06', rank_name: 'Senpai', belt: 'Verde', icon: 'white-belt.png', martialArtId: 2 },
                { code: 'K05', rank_name: 'Senpai', belt: 'Azul', icon: 'white-belt.png', martialArtId: 2 },
                { code: 'K04', rank_name: 'Senpai', belt: 'Morado', icon: 'white-belt.png', martialArtId: 2 },
                { code: 'K03', rank_name: 'Sendoin', belt: 'Marron', icon: 'white-belt.png', martialArtId: 2 },
                { code: 'K02', rank_name: 'Sendoin', belt: 'Marron Punta Negra', icon: 'white-belt.png', martialArtId: 2 },
                { code: 'K01', rank_name: 'Sendoin', belt: 'Marron Raya Negra', icon: 'white-belt.png', martialArtId: 2 },
                { code: 'K00', rank_name: 'Shidoin', belt: 'Negro', icon: 'black-belt.png', martialArtId: 2 },
                { code: 'D01', rank_name: 'Shidoin', belt: 'Negro', icon: 'black-belt.png', martialArtId: 2 },
                { code: 'D02', rank_name: 'Shidoin', belt: 'Negro', icon: 'black-belt.png', martialArtId: 2 },
                { code: 'D03', rank_name: 'Shihandai', belt: 'Negro', icon: 'black-belt.png', martialArtId: 2 },
                { code: 'D04', rank_name: 'Junshihan', belt: 'Negro', icon: 'black-belt.png', martialArtId: 2 },
                { code: 'D05', rank_name: 'Shihan', belt: 'Negro', icon: 'black-belt.png', martialArtId: 2 },
                { code: 'D06', rank_name: 'Renshi', belt: 'Negro', icon: 'black-belt.png', martialArtId: 2 },
                { code: 'D07', rank_name: 'Kyoshi', belt: 'Negro', icon: 'black-belt.png', martialArtId: 2 },
            ],
        });

        await this.prismaService.dojos.createMany({
            data: [
                { dojo: 'Dojo Kenzendo', address: '123 Main St', latitude: 10.6447, longitude: -71.6104, code: 'KZD' },
                { dojo: 'Dojo Okikonbukan', address: '456 Elm St', latitude: 10.6447, longitude: -71.6104, code: 'OKB' },
                { dojo: 'Dojo Okinawakan', address: '456 Elm St', latitude: 10.6447, longitude: -71.6104, code: 'OKK' },
            ],
        });

        await this.prismaService.dojoMartialArts.createMany({
            data: [
                { dojoId: 1, martialArtId: 1 },
                { dojoId: 1, martialArtId: 2 },
                { dojoId: 2, martialArtId: 1 },
                { dojoId: 2, martialArtId: 2 },
                { dojoId: 2, martialArtId: 3 },
                { dojoId: 3, martialArtId: 1 },
                { dojoId: 3, martialArtId: 2 },
                { dojoId: 3, martialArtId: 3 },
            ]
        })

        await this.prismaService.users.createMany({
            data: [
                {
                    identification: '00000001',
                    name: 'Super',
                    lastName: 'Admin',
                    password: 'admin',
                    email: 'admin@gmail.com',
                    username: 'Super Admin',
                    address: 'Urb la Floresta',
                    phone: '00000000000',
                    dojoId: 1,
                    rolId: 1,
                    birthday: new Date('2003-04-09'),
                    profileImg: 'profile.jpg',
                    active: true,
                    deleted: false,
                    enrollmentDate: new Date('2020-01-01')
                },
                {
                    identification: '00000001',
                    name: 'Luis Angel',
                    lastName: 'Ugaz Mendez',
                    password: 'admin',
                    email: 'luisangel@gmail.com',
                    username: 'Luis Angel',
                    address: 'Urb la Floresta',
                    phone: '04165610813',
                    dojoId: 1,
                    rolId: 2,
                    birthday: new Date('2003-04-09'),
                    profileImg: 'profile.jpg',
                    active: true,
                    deleted: false,
                    enrollmentDate: new Date('2020-01-01')
                },
                {
                    identification: '28391325',
                    name: 'Eduardo',
                    lastName: 'Rojas',
                    password: 'admin',
                    email: 'eduardo@gmail.com',
                    username: 'Eduardo Rojas',
                    address: 'Urb la Floresta',
                    phone: '04165610813',
                    dojoId: 1,
                    rolId: 2,
                    birthday: new Date('2002-02-28'),
                    profileImg: 'profile.jpg',
                    active: true,
                    deleted: false,
                    enrollmentDate: new Date('2020-01-01')
                }
            ]
        });

        await this.prismaService.userRanks.createMany({
            data: [
                { userId: 1, martialArtId: 1, currentRankId: 13 },
                { userId: 1, martialArtId: 2, currentRankId: 13 },
                { userId: 2, martialArtId: 1, currentRankId: 8 },
                { userId: 2, martialArtId: 2, currentRankId: 5 },
            ]
        });

        return {
            success: true,
            message: 'Datos iniciales cargados correctamente',
            data: null
        }
    }
}
