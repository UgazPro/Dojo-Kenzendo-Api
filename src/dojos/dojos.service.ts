import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { AttendanceFilter, DojoDto, DojoImagesDto, MarkAttendanceDto, ScheduleDojoDTO } from './dojo.dto';
import { badResponse, baseResponse } from '@/utilities/base.dto';
import { UserTokenDecode } from '@/users/users.dto';
import { Prisma } from '@/generated/prisma/client';

@Injectable()
export class DojosService {

    constructor(private readonly prismaService: PrismaService) { }

    private toSocialMediaJson(socialMedia?: DojoDto['socialMedia']): Prisma.InputJsonValue {
        return (socialMedia ?? []).map(item => ({
            socialMedia: item.socialMedia,
            link: item.link,
            directUrl: item.directUrl,
        })) as Prisma.InputJsonValue;
    }

    private async syncDojoMartialArts(dojoId: number, martialArtIds: number[]) {
        const uniqueIds = Array.from(new Set(martialArtIds));

        const currentRelations = await this.prismaService.dojoMartialArts.findMany({
            where: { dojoId },
            select: { martialArtId: true }
        });

        const currentIds: Set<number> = new Set(currentRelations.map(item => item.martialArtId));
        const requestedIds = new Set(uniqueIds);

        const toCreate = uniqueIds.filter(id => !currentIds.has(id));
        const toDelete = Array.from(currentIds).filter((id: number) => !requestedIds.has(id));

        if (toCreate.length === 0 && toDelete.length === 0) {
            return;
        }

        await this.prismaService.$transaction([
            ...(toDelete.length > 0
                ? [this.prismaService.dojoMartialArts.deleteMany({
                    where: {
                        dojoId,
                        martialArtId: { in: toDelete }
                    }
                })]
                : []),
            ...(toCreate.length > 0
                ? [this.prismaService.dojoMartialArts.createMany({
                    data: toCreate.map(martialArtId => ({ dojoId, martialArtId })),
                    skipDuplicates: true,
                })]
                : []),
        ]);
    }

    async getDojos(dojoId?: string) {
        const where: any = {};

        if (dojoId) {
            where.id = Number(dojoId);
        }

        return await this.prismaService.dojos.findMany({
            where,
            orderBy: { id: 'asc' },
            select: {
                id: true,
                dojo: true,
                address: true,
                logo: true,
                code: true,

                dojoMartialArts: {
                    include: { martialArt: true }
                }
            }
        }).then(dojos => {
            return dojos.map(dojo => ({
                ...dojo,
                dojoMartialArts: dojo.dojoMartialArts.map(dma => dma.martialArt)
            }))
        })
    }


    async getFullInfoDojo(code: string) {
        const dojoInfo = await this.prismaService.dojos.findFirst({
            where: { code },
            orderBy: { id: 'asc' },
            include: {
                dojoMartialArts: {
                    include: { martialArt: true }
                },
                Schedules: {
                    select: {
                        id: true,
                        name: true,
                        day: true,
                        startTime: true,
                        endTime: true,
                        martialArts: {
                            select: {
                                id: true,
                                martialArt: true,
                                icon: true
                            }
                        },
                    }
                },
                dojoImages: true,
            }
        });

        if (!dojoInfo) {
            return {
                ...badResponse,
                message: 'Dojo no encontrado'
            };
        }

        const [totalStudents, usersByRole] = await Promise.all([
            this.prismaService.users.count({
                where: {
                    dojoId: dojoInfo.id,
                    rol: { rol: 'Estudiante' },
                    active: true,
                    deleted: false,
                }
            }),
            this.prismaService.users.findMany({
                where: {
                    dojoId: dojoInfo.id,
                    active: true,
                    deleted: false,
                    rol: {
                        rol: {
                            in: ['Líder Instructor', 'Instructor']
                        }
                    }
                },
                select: {
                    id: true,
                    identification: true,
                    name: true,
                    profileImg: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    userRanks: {
                        select: {
                            rank: true,
                            martialArt: {
                                select: {
                                    martialArt: true,
                                    icon: true,
                                }
                            }
                        }
                    },
                    rol: {
                        select: {
                            rol: true,
                        }
                    }
                },
                orderBy: {
                    id: 'asc'
                }
            })
        ]);

        return {
            ...dojoInfo,
            dojoMartialArts: dojoInfo.dojoMartialArts.map(dma => dma.martialArt),
            totalStudents,
            masters: usersByRole,
        };
    }

    async getMartialArts(user: UserTokenDecode) {
        const where: any = {};

        if (user.rol.rol !== 'Administrador') {
            where.dojoMartialArts = {
                some: {
                    dojoId: user.dojoId
                }
            };
        }

        return await this.prismaService.martialArts.findMany({
            orderBy: { id: 'asc' },
            where
        });
    }

    async getRanks() {
        return await this.prismaService.ranks.findMany({
            orderBy: { id: 'asc' },
        });
    }

    async getAttendanceDojo(attendanceDojo: AttendanceFilter) {
        try {
            const report = await this.prismaService.dojoAttendance.groupBy({
                by: ['scheduleId'],
                _count: {
                    userId: true, // Cuenta los alumnos
                },
                where: {
                    attendanceDate: {
                        gte: attendanceDojo.startOfWeek, // Fecha de inicio de semana
                        lte: attendanceDojo.endOfWeek,   // Fecha de fin de semana
                    },
                    dojoId: attendanceDojo.dojoId,
                },
            });
            return report;
        }
        catch (err) {
            badResponse.message = 'Error al generar el reporte de asistencia';
            return badResponse;
        }
    }

    async createDojo(dojoData: DojoDto, logo: string, banner: string) {
        try {
            const dojo = await this.prismaService.dojos.create({
                data: {
                    dojo: dojoData.dojo,
                    address: dojoData.address,
                    addressShort: dojoData.addressShort,
                    latitude: dojoData.latitude,
                    longitude: dojoData.longitude,
                    logo: logo,
                    code: dojoData.code,
                    phone: dojoData.phone,
                    email: dojoData.email,
                    description: dojoData.description,
                    founded: dojoData.founded,
                    slogan: dojoData.slogan,
                    translate: dojoData.translate,
                    socialMedia: this.toSocialMediaJson(dojoData.socialMedia)
                }
            });
            await this.prismaService.dojoImages.create({
                data: {
                    dojoId: dojo.id,
                    type: 'banner',
                    url: banner,
                }
            });
            await this.prismaService.dojoMartialArts.createMany({
                data: dojoData.martialArts.map(martialArtId => ({
                    martialArtId,
                    dojoId: dojo.id,
                })),
            });
            const newDojo = await this.prismaService.dojos.findUnique({
                where: { id: dojo.id },
            })
            baseResponse.data = newDojo;
            baseResponse.message = 'Dojo creado correctamente';
            return baseResponse;
        }
        catch (error) {
            badResponse.message = 'Error al crear el dojo';
            return badResponse;
        }
    }

    async updateDojo(dojoData: DojoDto, id: number, logo?: string, banner?: string) {
        try {
            const dojo = await this.prismaService.dojos.update({
                where: { id },
                data: {
                    dojo: dojoData.dojo,
                    address: dojoData.address,
                    addressShort: dojoData.addressShort,
                    latitude: dojoData.latitude,
                    longitude: dojoData.longitude,
                    logo,
                    code: dojoData.code,
                    phone: dojoData.phone,
                    email: dojoData.email,
                    description: dojoData.description,
                    founded: dojoData.founded,
                    slogan: dojoData.slogan,
                    translate: dojoData.translate,
                    socialMedia: this.toSocialMediaJson(dojoData.socialMedia)
                }
            });
            if (banner) {
                const findBanner = await this.prismaService.dojoImages.findFirst({
                    where: { dojoId: dojo.id, type: 'banner' },
                });

                if (findBanner) {
                    await this.prismaService.dojoImages.update({
                        where: { id: findBanner.id, type: 'banner' },
                        data: {
                            url: banner,
                        }
                    });
                } else {
                    await this.prismaService.dojoImages.create({
                        data: {
                            dojoId: dojo.id,
                            type: 'banner',
                            url: banner,
                        }
                    });
                }
            }

            await this.syncDojoMartialArts(dojo.id, dojoData.martialArts);

            const dojoUpdated = await this.prismaService.dojos.findUnique({
                where: { id: dojo.id },
            })
            baseResponse.data = dojoUpdated;
            baseResponse.message = 'Dojo actualizado correctamente';
            return baseResponse;
        }
        catch (error) {
            console.log(error);
            
            badResponse.data = error;
            badResponse.message = 'Error al actualizar el dojo';
            return badResponse;
        }
    }

    deleteDojo(id: number) {
        return this.prismaService.dojos.delete({
            where: { id }
        });
    }

    //Schedules

    async getScheduleDojo(dojoId?: string) {
        const where: any = {};
        if (dojoId) {
            where.dojoId = Number(dojoId);
        }

        return await this.prismaService.dojos.findMany({
            where,
            include: {
                Schedules: {
                    include: {
                        martialArts: true
                    }
                }
            }
        });
    }

    //Get class attendance status
    async getClassAttendanceStatus(dojoId: number, scheduleId: number, date: Date) {
        // 1. Obtener todos los alumnos que pertenecen a ese dojo
        const allStudents = await this.prismaService.users.findMany({
            where: { dojoId, rol: { rol: 'Estudiante' }, active: true },
            select: { id: true, name: true, lastName: true }
        });

        // 2. Obtener los IDs de quienes marcaron asistencia ese día para ese horario
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        const attendance = await this.prismaService.dojoAttendance.findMany({
            where: {
                scheduleId,
                attendanceDate: { gte: startOfDay, lte: endOfDay }
            },
            select: { userId: true }
        });

        const presentIds = attendance.map(a => a.userId);

        // 3. Cruzar la información
        return allStudents.map(student => ({
            ...student,
            status: presentIds.includes(student.id) ? 'Presente' : 'Ausente'
        }));
    }

    //Get student attendance history
    async getStudentAttendanceHistory(userId: number) {
        return this.prismaService.dojoAttendance.findMany({
            where: {
                userId,
            },
            include: {
                schedule: {
                    include: { martialArts: true }
                },
                dojo: true
            },
            orderBy: { attendanceDate: 'desc' }
        });
    }

    async createScheduleDojo(schedule: ScheduleDojoDTO) {
        try {
            const newSchedule = await this.prismaService.schedules.createMany({
                data: schedule.schedule.map(item => ({
                    dojoId: item.dojoId,
                    day: item.day,
                    name: item.name,
                    startTime: item.startTime,
                    endTime: item.endTime,
                    martialArtId: item.martialArtId
                }))
            });

            const scheduleUpdated = await this.prismaService.schedules.findMany({
                where: { dojoId: schedule.schedule[0].dojoId },
                select: {
                    id: true,
                    name: true,
                    day: true,
                    startTime: true,
                    endTime: true,
                    martialArts: {
                        select: {
                            id: true,
                            martialArt: true,
                            icon: true
                        }
                    },
                }
            })

            baseResponse.data = scheduleUpdated;
            baseResponse.message = 'Horario del dojo creado correctamente';
            return baseResponse;
        } catch (err) {
            badResponse.message = 'Error al crear el horario del dojo';
            return badResponse;
        }
    }

    async updateScheduleDojo(schedule: ScheduleDojoDTO) {
        try {
            const updatedSchedules: any[] = [];
            for (const item of schedule.schedule) {
                const updatedSchedule = await this.prismaService.schedules.updateMany({
                    where: {
                        dojoId: item.dojoId,
                        day: item.day,
                        martialArtId: item.martialArtId,
                    },
                    data: {
                        name: item.name,
                        startTime: item.startTime,
                        endTime: item.endTime,
                    }
                });
                updatedSchedules.push(updatedSchedule);
            }
            baseResponse.data = updatedSchedules;
            baseResponse.message = 'Horario del dojo actualizado correctamente';
            return baseResponse;
        } catch (err) {
            badResponse.message = 'Error al actualizar el horario del dojo';
            return badResponse;
        }
    }

    async deleteScheduleDojo(id: number) {
        try {
            await this.prismaService.schedules.delete({
                where: { id }
            });
            baseResponse.message = 'Horario del dojo eliminado correctamente';
            return baseResponse;
        } catch (err) {
            badResponse.message = 'Error al eliminar el horario del dojo';
            return badResponse;
        }
    }


    // Images
    async getDojoImages(dojoId: number) {
        try {
            const images = await this.prismaService.dojoImages.findMany({
                where: { dojoId },
                orderBy: { id: 'asc' }
            });
            return images;
        } catch (err) {
            badResponse.message = 'Error al obtener las imágenes del dojo';
            return badResponse;
        }
    }

    async addDojoImages(data: DojoImagesDto) {
        try {
            const created = await this.prismaService.dojoImages.createMany({
                data: data.urls.map(url => ({ dojoId: data.dojoId, type: data.type, url })),
                skipDuplicates: true,
            });
            baseResponse.data = created;
            baseResponse.message = 'Imágenes agregadas correctamente';
            return baseResponse;
        } catch (err) {
            badResponse.message = 'Error al agregar las imágenes del dojo';
            return badResponse;
        }
    }

    async deleteDojoImage(id: number) {
        try {
            await this.prismaService.dojoImages.delete({ where: { id } });
            baseResponse.message = 'Imagen eliminada correctamente';
            return baseResponse;
        } catch (err) {
            badResponse.message = 'Error al eliminar la imagen del dojo';
            return badResponse;
        }
    }


    //Attendance

    // 1. Lógica para detectar el horario actual del Dojo
    async getCurrentSchedule(dojoId: number) {
        const now = new Date();
        const days = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
        const currentDay = days[now.getDay()];

        // Formato HH:mm para comparar con tus strings de Schedules
        const currentTime = now.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        // Buscamos si hay una clase ocurriendo ahora en ese dojo
        const schedule = await this.prismaService.schedules.findFirst({
            where: {
                dojoId,
                day: currentDay,
                startTime: { lte: currentTime },
                endTime: { gte: currentTime },
            },
            include: { martialArts: true }
        });

        return schedule;
    }

    // 2. Registrar la asistencia masiva
    async markBulkAttendance(data: MarkAttendanceDto, user: UserTokenDecode) {
        const { scheduleId, userIds, reason, came } = data;
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalizamos a inicio del día para evitar duplicados diarios

        const dojoId = user.rol.rol === 'Administrador' ? data.dojoId : user.dojoId; // Si es admin, puede marcar para cualquier dojo, si no, solo para su dojo

        // Creamos los registros en una transacción de base de datos
        const attendanceRecords = userIds.map(userId => ({
            userId,
            dojoId,
            reason,
            came,
            scheduleId,
            attendanceDate: new Date(), // Fecha y hora exacta del marcado
            markedBy: user.id, // ID del usuario que marcó la asistencia
        }));

        return this.prismaService.dojoAttendance.createMany({
            data: attendanceRecords,
            skipDuplicates: true, // Evita errores si el maestro le da clic dos veces
        });
    }

}
