import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ActivityDto, ActivityFilterDto, ActivityImagesDto, AppliedStudentDto, ExamDto, ExamStudentsDto, MarkActivityAttendanceDto } from './activities.dto';
import { badResponse, baseResponse } from '@/utilities/base.dto';

@Injectable()
export class ActivitiesService {
    constructor(private readonly prismaService: PrismaService) {

    }

    async getActivities(filters: ActivityFilterDto) {
        const where: any = {};

        // Por defecto solo próximas (hoy en adelante) si no se pide historial
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (!filters?.includePast) {
            where.date = { gte: today };
        }

        if (filters?.dojoId) {
            where.OR = [
                { dojosId: filters.dojoId },
                { ActivityDojos: { some: { dojoId: filters.dojoId } } },
            ];
        }

        if (filters?.startDate && filters?.endDate) {
            const start = new Date(filters.startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(filters.endDate);
            end.setHours(23, 59, 59, 999);
            where.date = { gte: start, lte: end };
        }

        if (filters?.place) {
            where.place = { contains: filters.place, mode: 'insensitive' };
        }

        if (filters?.name) {
            where.name = { contains: filters.name, mode: 'insensitive' };
        }

        try {
            const activities = await this.prismaService.activities.findMany({
                where,
                include: {
                    ActivityDojos: {
                        include: {
                            dojo: {
                                select: {
                                    id: true,
                                    dojo: true,
                                    address: true,
                                }
                            }
                        }
                    },
                    dojos: true,
                }
            });
            return activities;
        } catch (error) {
            badResponse.message = error.message;
            return badResponse;
        }
    }

    async getCurrentActivity(dojoId?: number) {
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        const where: any = {
            date: {
                gte: startOfDay,
                lte: endOfDay,
            },
        };

        if (dojoId) {
            where.OR = [
                { dojosId: dojoId },
                { ActivityDojos: { some: { dojoId } } },
            ];
        }

        try {
            const activity = await this.prismaService.activities.findFirst({
                where,
                orderBy: { date: 'asc' },
                include: {
                    ActivityDojos: {
                        include: {
                            dojo: {
                                select: { id: true, dojo: true, address: true },
                            }
                        }
                    },
                    dojos: true,
                }
            });
            return activity;
        } catch (error) {
            badResponse.message = error.message;
            return badResponse;
        }
    }

    async createActivity(activity: ActivityDto) {
        const today = new Date();
        const minDate = new Date();
        minDate.setDate(today.getDate() + 7);

        if (activity.date < minDate) {
            badResponse.message = 'La fecha debe ser al menos 7 días después de hoy';
            return badResponse;
        }

        try {
            const created = await this.prismaService.activities.create({
                data: {
                    name: activity.name,
                    date: activity.date,
                    place: activity.place,
                    latitude: activity.latitude,
                    longitude: activity.longitude,
                    price: activity.price,
                    dojosId: activity.dojosId ?? null,
                }
            });

            if (activity.dojoIds?.length) {
                await this.prismaService.activityDojos.createMany({
                    data: activity.dojoIds.map(dojoId => ({
                        dojoId,
                        activityId: created.id,
                    })),
                    skipDuplicates: true,
                });
            }

            const newActivity = await this.prismaService.activities.findUnique({
                where: { id: created.id },
                include: {
                    ActivityDojos: true,
                    dojos: true,
                }
            });

            baseResponse.data = newActivity;
            baseResponse.message = 'Actividad creada correctamente';
            return baseResponse;
        } catch (error) {
            badResponse.message = error.message;
            return badResponse;
        }
    }

    async updateActivity(id: number, activity: ActivityDto) {
        const today = new Date();
        const minDate = new Date();
        minDate.setDate(today.getDate() + 7);

        if (activity.date < minDate) {
            badResponse.message = 'La fecha debe ser al menos 7 días después de hoy';
            return badResponse;
        }

        try {
            await this.prismaService.activities.update({
                where: { id },
                data: {
                    name: activity.name,
                    date: activity.date,
                    place: activity.place,
                    latitude: activity.latitude,
                    longitude: activity.longitude,
                    dojosId: activity.dojosId ?? null,
                }
            });

            if (activity.dojoIds) {
                await this.prismaService.activityDojos.deleteMany({ where: { activityId: id } });
                if (activity.dojoIds.length) {
                    await this.prismaService.activityDojos.createMany({
                        data: activity.dojoIds.map(dojoId => ({ dojoId, activityId: id })),
                        skipDuplicates: true,
                    });
                }
            }

            const updated = await this.prismaService.activities.findUnique({
                where: { id },
                include: {
                    ActivityDojos: true,
                    dojos: true,
                }
            });

            baseResponse.data = updated;
            baseResponse.message = 'Actividad actualizada correctamente';
            return baseResponse;
        } catch (error) {
            badResponse.message = error.message;
            return badResponse;
        }
    }

    async getActivityAttendance(activityId: number) {
        try {
            const attendance = await this.prismaService.activityAttendance.findMany({
                where: { activityId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            lastName: true,
                            identification: true,
                        }
                    }
                }
            });
            return attendance;
        } catch (error) {
            badResponse.message = error.message;
            return badResponse;
        }
    }

    async markActivityAttendance(data: MarkActivityAttendanceDto) {
        try {
            const records = data.userIds.map(userId => ({
                activityId: data.activityId,
                userId,
            }));

            const result = await this.prismaService.activityAttendance.createMany({
                data: records,
                skipDuplicates: true,
            });

            baseResponse.data = result;
            baseResponse.message = 'Asistencia registrada correctamente';
            return baseResponse;
        } catch (error) {
            badResponse.message = error.message;
            return badResponse;
        }
    }

    async getExams(activityId?: number, userId?: number, martialArtId?: number) {
        const where: any = {};

        if (activityId) where.activityId = activityId;
        if (userId) where.userId = userId;
        if (martialArtId) where.martialArtId = martialArtId;

        try {
            const exams = await this.prismaService.exams.findMany({
                where,
                include: {
                    activity: true,
                    martialArt: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            lastName: true,
                        }
                    },
                    ranks: true,
                }
            });
            return exams;
        } catch (error) {
            badResponse.message = error.message;
            return badResponse;
        }
    }

    async createExam(exam: ExamStudentsDto) {
        try {
            const created = await this.prismaService.exams.createMany({
                data: exam.exams.map(item => ({
                    martialArtId: item.martialArtId,
                    userId: item.userId,
                    ranksId: item.ranksId,
                    activityId: item.activityId,
                }))
            });

            baseResponse.data = created;
            baseResponse.message = 'Examen creado correctamente';
            return baseResponse;
        } catch (error) {
            badResponse.message = error.message;
            return badResponse;
        }
    }

    async updateExam(id: number, exam: ExamDto) {
        try {
            const updated = await this.prismaService.exams.update({
                where: { id },
                data: {
                    martialArtId: exam.martialArtId,
                    userId: exam.userId,
                    ranksId: exam.ranksId,
                    activityId: exam.activityId,
                }
            });

            baseResponse.data = updated;
            baseResponse.message = 'Examen actualizado correctamente';
            return baseResponse;
        } catch (error) {
            badResponse.message = error.message;
            return badResponse;
        }
    }

    async getAppliedStudents(activityId?: number, userId?: number, martialArtId?: number) {
        const where: any = {};

        if (activityId) where.activityId = activityId;
        if (userId) where.userId = userId;
        if (martialArtId) where.martialArtId = martialArtId;

        try {
            const applied = await this.prismaService.appliedStudents.findMany({
                where,
                include: {
                    activity: true,
                    martialArt: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            lastName: true,
                        }
                    },
                    ranks: true,
                }
            });
            return applied;
        } catch (error) {
            badResponse.message = error.message;
            return badResponse;
        }
    }

    async createAppliedStudent(data: AppliedStudentDto) {
        try {
            const created = await this.prismaService.appliedStudents.create({
                data: {
                    activityId: data.activityId,
                    userId: data.userId,
                    martialArtId: data.martialArtId,
                    ranksId: data.ranksId,
                }
            });

            baseResponse.data = created;
            baseResponse.message = 'Postulación creada correctamente';
            return baseResponse;
        } catch (error) {
            badResponse.message = error.message;
            return badResponse;
        }
    }

    async updateAppliedStudent(id: number, data: AppliedStudentDto) {
        try {
            const updated = await this.prismaService.appliedStudents.update({
                where: { id },
                data: {
                    activityId: data.activityId,
                    userId: data.userId,
                    martialArtId: data.martialArtId,
                    ranksId: data.ranksId,
                }
            });

            baseResponse.data = updated;
            baseResponse.message = 'Postulación actualizada correctamente';
            return baseResponse;
        } catch (error) {
            badResponse.message = error.message;
            return badResponse;
        }
    }

    // Images
    async getActivityImages(activityId: number) {
        try {
            const images = await this.prismaService.activitiesImages.findMany({
                where: { activityId },
                orderBy: { id: 'asc' },
            });
            return images;
        } catch (error) {
            badResponse.message = 'Error al obtener las imágenes de la actividad';
            return badResponse;
        }
    }

    async addActivityImages(data: ActivityImagesDto) {
        try {
            const created = await this.prismaService.activitiesImages.createMany({
                data: data.urls.map(url => ({ activityId: data.activityId, url })),
                skipDuplicates: true,
            });
            baseResponse.data = created;
            baseResponse.message = 'Imágenes agregadas correctamente';
            return baseResponse;
        } catch (error) {
            badResponse.message = 'Error al agregar las imágenes de la actividad';
            return badResponse;
        }
    }

    async deleteActivityImage(id: number) {
        try {
            await this.prismaService.activitiesImages.delete({ where: { id } });
            baseResponse.message = 'Imagen eliminada correctamente';
            return baseResponse;
        } catch (error) {
            badResponse.message = 'Error al eliminar la imagen de la actividad';
            return badResponse;
        }
    }
}
