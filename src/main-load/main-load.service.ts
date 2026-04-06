import { PrismaService } from '@/prisma/prisma.service';
import { DtoBaseResponse } from '@/utilities/base.dto';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

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
                { code: '10 Kyu', rank_name: '', belt: 'Blanco', icon: 'white-belt.png', martialArtId: 1 },
                { code: '9 Kyu', rank_name: '', belt: 'Blanco Punta Amarillo', icon: 'white-belt.png', martialArtId: 1 },
                { code: '8 Kyu', rank_name: '', belt: 'Blanco Raya Amarillo', icon: 'white-belt.png', martialArtId: 1 },
                { code: '7 Kyu', rank_name: '', belt: 'Amarillo', icon: 'white-belt.png', martialArtId: 1 },
                { code: '6 Kyu', rank_name: '', belt: 'Naranja', icon: 'white-belt.png', martialArtId: 1 },
                { code: '5 Kyu', rank_name: 'Senpai', belt: 'Verde', icon: 'white-belt.png', martialArtId: 1 },
                { code: '4 Kyu', rank_name: 'Senpai', belt: 'Azul', icon: 'white-belt.png', martialArtId: 1 },
                { code: '3 Kyu', rank_name: 'Sendoin', belt: 'Marron', icon: 'white-belt.png', martialArtId: 1 },
                { code: '2 Kyu', rank_name: 'Sendoin', belt: 'Marron Punta Negra', icon: 'white-belt.png', martialArtId: 1 },
                { code: '1 Kyu', rank_name: 'Sendoin', belt: 'Marron Raya Negra', icon: 'white-belt.png', martialArtId: 1 },
                { code: '0 Kyu', rank_name: 'Shidoin', belt: 'Negro', icon: 'black-belt.png', martialArtId: 1 },
                { code: '1 Dan', rank_name: 'Shidoin', belt: 'Negro', icon: 'black-belt.png', martialArtId: 1 },
                { code: '2 Dan', rank_name: 'Shidoin', belt: 'Negro', icon: 'black-belt.png', martialArtId: 1 },
                { code: '3 Dan', rank_name: 'Shihandai', belt: 'Negro', icon: 'black-belt.png', martialArtId: 1 },
                { code: '4 Dan', rank_name: 'Junshihan', belt: 'Negro', icon: 'black-belt.png', martialArtId: 1 },
                { code: '5 Dan', rank_name: 'Shihan', belt: 'Negro', icon: 'black-belt.png', martialArtId: 1 },
                { code: '6 Dan', rank_name: 'Renshi', belt: 'Negro', icon: 'black-belt.png', martialArtId: 1 },
                { code: '7 Dan', rank_name: 'Kyoshi', belt: 'Negro', icon: 'black-belt.png', martialArtId: 1 },

                //Kobudo
                { code: '11 Kyu', rank_name: '', belt: 'Blanco', icon: 'white-belt.png', martialArtId: 2 },
                { code: '10 Kyu', rank_name: '', belt: 'Blanco Punta Amarillo', icon: 'white-belt.png', martialArtId: 2 },
                { code: '9 Kyu', rank_name: '', belt: 'Blanco Raya Amarillo', icon: 'white-belt.png', martialArtId: 2 },
                { code: '8 Kyu', rank_name: '', belt: 'Amarillo', icon: 'white-belt.png', martialArtId: 2 },
                { code: '7 Kyu', rank_name: '', belt: 'Naranja', icon: 'white-belt.png', martialArtId: 2 },
                { code: '6 Kyu', rank_name: 'Senpai', belt: 'Verde', icon: 'white-belt.png', martialArtId: 2 },
                { code: '5 Kyu', rank_name: 'Senpai', belt: 'Azul', icon: 'white-belt.png', martialArtId: 2 },
                { code: '4 Kyu', rank_name: 'Senpai', belt: 'Morado', icon: 'white-belt.png', martialArtId: 2 },
                { code: '3 Kyu', rank_name: 'Sendoin', belt: 'Marron', icon: 'white-belt.png', martialArtId: 2 },
                { code: '2 Kyu', rank_name: 'Sendoin', belt: 'Marron Punta Negra', icon: 'white-belt.png', martialArtId: 2 },
                { code: '1 Kyu', rank_name: 'Sendoin', belt: 'Marron Raya Negra', icon: 'white-belt.png', martialArtId: 2 },
                { code: '0 Kyu', rank_name: 'Shidoin', belt: 'Negro', icon: 'black-belt.png', martialArtId: 2 },
                { code: '1 Dan', rank_name: 'Shidoin', belt: 'Negro', icon: 'black-belt.png', martialArtId: 2 },
                { code: '2 Dan', rank_name: 'Shidoin', belt: 'Negro', icon: 'black-belt.png', martialArtId: 2 },
                { code: '3 Dan', rank_name: 'Shihandai', belt: 'Negro', icon: 'black-belt.png', martialArtId: 2 },
                { code: '4 Dan', rank_name: 'Junshihan', belt: 'Negro', icon: 'black-belt.png', martialArtId: 2 },
                { code: '5 Dan', rank_name: 'Shihan', belt: 'Negro', icon: 'black-belt.png', martialArtId: 2 },
                { code: '6 Dan', rank_name: 'Renshi', belt: 'Negro', icon: 'black-belt.png', martialArtId: 2 },
                { code: '7 Dan', rank_name: 'Kyoshi', belt: 'Negro', icon: 'black-belt.png', martialArtId: 2 },
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
                    password: await bcrypt.hash('admin' as string, 12),
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
                    password: await bcrypt.hash('admin' as string, 12),
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
                    password: await bcrypt.hash('admin' as string, 12),
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

        // Actividades de ejemplo
        const activitySeminar = await this.prismaService.activities.create({
            data: {
                name: 'Seminario Kata Avanzado',
                date: new Date('2026-02-15T10:00:00Z'),
                place: 'Dojo Kenzendo',
                latitude: 10.6447,
                longitude: -71.6104,
            }
        });

        const activityTournament = await this.prismaService.activities.create({
            data: {
                name: 'Torneo Regional',
                date: new Date('2026-03-10T14:00:00Z'),
                place: 'Polideportivo Maracaibo',
                latitude: 10.6499,
                longitude: -71.6120,
            }
        });

        const activityExamDay = await this.prismaService.activities.create({
            data: {
                name: 'Jornada de Exámenes',
                date: new Date('2026-04-05T09:00:00Z'),
                place: 'Dojo Okikonbukan',
                latitude: 10.6447,
                longitude: -71.6104,
            }
        });

        await this.prismaService.activityDojos.createMany({
            data: [
                { activityId: activitySeminar.id, dojoId: 1 },
                { activityId: activitySeminar.id, dojoId: 3 },
                { activityId: activityTournament.id, dojoId: 2 },
                { activityId: activityTournament.id, dojoId: 1 },
                { activityId: activityExamDay.id, dojoId: 2 },
            ],
            skipDuplicates: true,
        });

        await this.prismaService.activityAttendance.createMany({
            data: [
                { activityId: activitySeminar.id, userId: 2 },
                { activityId: activitySeminar.id, userId: 3 },
                { activityId: activityTournament.id, userId: 1 },
                { activityId: activityTournament.id, userId: 2 },
            ],
            skipDuplicates: true,
        });

        // Exámenes asociados a actividades (historial)
        await this.prismaService.exams.createMany({
            data: [
                { martialArtId: 1, userId: 2, ranksId: 8, activityId: activityExamDay.id },
                { martialArtId: 1, userId: 3, ranksId: 6, activityId: activityExamDay.id },
                { martialArtId: 2, userId: 1, ranksId: 20, activityId: activityExamDay.id },
            ],
            skipDuplicates: true,
        });

        // Postulaciones a exámenes
        await this.prismaService.appliedStudents.createMany({
            data: [
                { martialArtId: 1, userId: 2, ranksId: 8, activityId: activityExamDay.id },
                { martialArtId: 1, userId: 3, ranksId: 6, activityId: activityExamDay.id },
                { martialArtId: 2, userId: 1, ranksId: 20, activityId: activityExamDay.id },
            ],
            skipDuplicates: true,
        });

        return {
            success: true,
            message: 'Datos iniciales cargados correctamente',
            data: null
        }
    }
}
