import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { AttendanceFilter, DojoDto, MarkAttendanceDto, ScheduleDojoDTO } from './dojo.dto';
import { badResponse, baseResponse } from '@/utilities/base.dto';

@Injectable()
export class DojosService {

    constructor(private readonly prismaService: PrismaService) { }

    async getDojos(dojoId?: string, name?: string, address?: string) {
        const where: any = {};

        if (dojoId) {
            where.id = Number(dojoId);
        }

        if (name) {
            where.dojo = { contains: name, mode: 'insensitive' };
        }

        if (address) {
            where.address = { contains: address, mode: 'insensitive' };
        }

        return await this.prismaService.dojos.findMany({
            where
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

    async createDojo(dojoData: DojoDto) {
        try {
            const dojo = await this.prismaService.dojos.create({
                data: {
                    dojo: dojoData.dojo,
                    address: dojoData.address,
                    latitude: dojoData.latitude,
                    longitude: dojoData.longitude,
                    code: dojoData.code
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

    async updateDojo(dojoData: DojoDto, id: number) {
        try {
            const dojo = await this.prismaService.dojos.update({
                where: { id },
                data: {
                    dojo: dojoData.dojo,
                    address: dojoData.address,
                    latitude: dojoData.latitude,
                    longitude: dojoData.longitude,
                    code: dojoData.code
                }
            });
            await this.prismaService.dojoMartialArts.updateMany({
                data: dojoData.martialArts.map(martialArtId => ({
                    martialArtId,
                    dojoId: dojo.id,
                })),
            });
            const newDojo = await this.prismaService.dojos.findUnique({
                where: { id: dojo.id },
            })
            baseResponse.data = newDojo;
            baseResponse.message = 'Dojo actualizado correctamente';
            return baseResponse;
        }
        catch (error) {
            badResponse.message = 'Error al actualizar el dojo';
            return badResponse;
        }
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

            baseResponse.data = newSchedule;
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
    async markBulkAttendance(data: MarkAttendanceDto) {
        const { dojoId, scheduleId, userIds } = data;
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalizamos a inicio del día para evitar duplicados diarios

        // Creamos los registros en una transacción de base de datos
        const attendanceRecords = userIds.map(userId => ({
            userId,
            dojoId,
            scheduleId,
            attendanceDate: new Date(), // Fecha y hora exacta del marcado
        }));

        return this.prismaService.dojoAttendance.createMany({
            data: attendanceRecords,
            skipDuplicates: true, // Evita errores si el maestro le da clic dos veces
        });
    }

}
