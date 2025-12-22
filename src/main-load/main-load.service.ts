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
                { martialArt: 'Karate' },
                { martialArt: 'Kobudo' },
                { martialArt: 'Kendo Iaido' },
            ],
        });

        await this.prismaService.roles.createMany({
            data: [
                { rol: 'Administrador', },
                { rol: 'Instructor', },
                { rol: 'Estudiante', },
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
                { code: 'K00', rank_name: 'Shidoin', belt: 'Blanco', icon: 'white-belt.png', martialArtId: 1 },
            ],
        });

        await this.prismaService.dojos.createMany({
            data: [
                { dojo: 'Dojo Kenzendo', address: '123 Main St', location: '', code: '', martialArts: [1, 2] },
                { dojo: 'Dojo Okikonbukan', address: '456 Elm St', location: '', code: '', martialArts: [1, 2, 3] },
            ],
        });

        await this.prismaService.users.createMany({
            data: [
                {
                    identification: '00000001',
                    name: 'Luis Angel',
                    lastName: 'Ugaz Mendez',
                    password: 'admin',
                    email: 'luisangel@gmail.com',
                    username: 'luisangel',
                    address: 'Urb la Floresta',
                    phone: '04165610813',
                    dojoId: 1,
                    rolId: 2,
                    birthday: new Date('1990-01-01'),
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
                    username: 'eduardo28',
                    address: 'Urb la Floresta',
                    phone: '04165610813',
                    dojoId: 1,
                    rolId: 2,
                    birthday: new Date('1990-01-01'),
                    profileImg: 'profile.jpg',
                    active: true,
                    deleted: false,
                    enrollmentDate: new Date('2020-01-01')
                }
            ]
        });

        return {
            success: true,
            message: 'Datos iniciales cargados correctamente',
        }
    }
}
