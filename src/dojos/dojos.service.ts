import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { DojoDto, ScheduleDojoDTO } from './dojo.dto';
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


}
