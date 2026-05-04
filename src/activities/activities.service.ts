import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ActivityDto, ActivityFilterDto, ActivityImagesDto, AppliedManyStudentsDto, AppliedStudentDto, ExamDto, ExamStudentsDto, MarkActivityAttendanceDto } from './activities.dto';
import { badResponse, baseResponse } from '@/utilities/base.dto';
import { UserTokenDecode } from '@/users/users.dto';
import { id } from 'date-fns/locale';

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
                        select: {
                            dojo: {
                                select: {
                                    id: true,
                                    dojo: true,
                                    address: true,
                                }
                            }
                        }
                    },
                }
            });
            return activities;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            badResponse.message = message;
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
                }
            });
            return activity;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            badResponse.message = message;
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
                    type: activity.type,
                    description: activity.description,
                    latitude: activity.latitude,
                    longitude: activity.longitude,
                    price: activity.price,
                }
            });

            await this.prismaService.activityDojos.createMany({
                data: activity.dojoIds.map(dojoId => ({
                    dojoId,
                    activityId: created.id,
                })),
                skipDuplicates: true,
            });

            const newActivity = await this.prismaService.activities.findUnique({
                where: { id: created.id },
                include: {
                    ActivityDojos: {
                        select: {
                            dojo: {
                                select: { id: true, dojo: true, address: true },
                            }
                        }
                    },
                }
            });

            baseResponse.data = newActivity;
            baseResponse.message = 'Actividad creada correctamente';
            return baseResponse;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            badResponse.message = message;
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
                    type: activity.type,
                    description: activity.description,
                    latitude: activity.latitude,
                    longitude: activity.longitude,
                }
            });


            await this.prismaService.activityDojos.deleteMany({ where: { activityId: id } });

            if (activity.dojoIds.length) {
                await this.prismaService.activityDojos.createMany({
                    data: activity.dojoIds.map(dojoId => ({ dojoId, activityId: id })),
                    skipDuplicates: true,
                });
            }

            const updated = await this.prismaService.activities.findUnique({
                where: { id },
                include: {
                    ActivityDojos: {
                        select: {
                            dojo: {
                                select: { id: true, dojo: true, address: true },
                            }
                        }
                    },
                }
            });

            baseResponse.data = updated;
            baseResponse.message = 'Actividad actualizada correctamente';
            return baseResponse;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            badResponse.message = message;
            return badResponse;
        }
    }

    async deleteActivity(id: number, user: UserTokenDecode) {
        try {
            const findActivity = await this.prismaService.activities.findUnique({ where: { id } });

            if (!findActivity) {
                badResponse.message = 'Actividad no encontrada';
                return badResponse;
            }

            if (user.rol.rol !== 'Administrador') {
                badResponse.message = 'No tienes permisos para eliminar esta actividad';
                return badResponse;
            }

            await this.prismaService.activities.update({
                where: { id },
                data: {
                    deleted: true,
                }
            });

            baseResponse.message = 'Actividad eliminada correctamente';
            return baseResponse;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            badResponse.message = message;
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
            const message = error instanceof Error ? error.message : String(error);
            badResponse.message = message;
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
            const message = error instanceof Error ? error.message : String(error);
            badResponse.message = message;
            return badResponse;
        }
    }

    //Historial de exámenes
    async getExams(activityId?: number, userId?: number, martialArtId?: number) {
        const where: any = {};

        if (activityId) where.activityId = activityId;
        if (userId) where.userId = userId;
        if (martialArtId) where.martialArtId = martialArtId;

        try {
            const exams = await this.prismaService.exams.findMany({
                where,
                include: {
                    activity: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            date: true
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            lastName: true,
                        }
                    },
                    ranks: {
                        include: {
                            martialArt: true,
                        }
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
            return exams;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            badResponse.message = message;
            return badResponse;
        }
    }

    async saveExam(exam: ExamStudentsDto) {
        try {
            const getUsersApplied = await this.prismaService.appliedStudents.findMany({
                where: {
                    userId: { in: exam.exams.map(e => e.userId) },
                    martialArtId: { in: exam.exams.map(e => e.martialArtId) },
                },
                orderBy: { createdAt: 'desc' },
            });

            await this.prismaService.exams.createMany({
                data: getUsersApplied.map(item => ({
                    martialArtId: item.martialArtId,
                    userId: item.userId,
                    ranksId: item.ranksId,
                    activityId: item.activityId,
                    status: exam.exams.find(e => e.userId === item.userId && e.martialArtId === item.martialArtId)?.status || 'Pendiente',
                }))
            });

            await this.prismaService.appliedStudents.deleteMany({
                where: {
                    userId: { in: exam.exams.map(e => e.userId) },
                    martialArtId: { in: exam.exams.map(e => e.martialArtId) },
                }
            });

            baseResponse.data = null;
            baseResponse.message = 'Examen creado correctamente';
            return baseResponse;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            badResponse.message = message;
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
                    activity: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            date: true
                        }
                    },
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
            const message = error instanceof Error ? error.message : String(error);
            badResponse.message = message;
            return badResponse;
        }
    }

    async getAppliedStudentSuggestion({ dojoId, user }: { dojoId?: number, user: UserTokenDecode }) {
        try {

            const where: any = {
                deleted: false
            };

            if (user.rol.rol !== 'Administrador') {
                where.dojoId = user.dojoId;
            } else if (dojoId) {
                where.dojoId = dojoId;
            }

            const now = new Date();
            const minDate = new Date(now);
            minDate.setMonth(minDate.getMonth() - 8);

            const students = await this.prismaService.users.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    lastName: true,
                    enrollmentDate: true,
                    identification: true,
                    birthday: true,
                    dojo: {
                        select: {
                            dojoMartialArts: {
                                select: {
                                    martialArtId: true,
                                    martialArt: {
                                        select: {
                                            id: true,
                                            martialArt: true,
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!students.length) {
                return [];
            }

            const userIds = students.map(item => item.id);
            const exams = await this.prismaService.exams.findMany({
                where: {
                    userId: { in: userIds },
                    status: 'Aprobado',
                },
                select: {
                    userId: true,
                    martialArtId: true,
                    activity: {
                        select: {
                            date: true,
                        }
                    },
                },
                orderBy: { activity: { date: 'desc' } },
            });

            const lastExamByUserAndMartialArt = new Map<string, Date>();
            for (const exam of exams) {
                const key = `${exam.userId}-${exam.martialArtId}`;
                if (!lastExamByUserAndMartialArt.has(key)) {
                    lastExamByUserAndMartialArt.set(key, exam.activity.date);
                }
            }

            const studentsSuggestion = students.map(student => {
                const suggestedByMartialArt = student.dojo.dojoMartialArts.map(item => {
                    const key = `${student.id}-${item.martialArtId}`;
                    const lastExamDate = lastExamByUserAndMartialArt.get(key) || null;
                    const hasEnoughEnrollmentTime = student.enrollmentDate <= minDate;
                    const hasEnoughTimeFromLastExam = !lastExamDate || lastExamDate <= minDate;

                    return {
                        martialArtId: item.martialArt.id,
                        martialArt: item.martialArt.martialArt,
                        lastExamDate,
                        suggested: hasEnoughEnrollmentTime && hasEnoughTimeFromLastExam,
                    };
                });

                const parseStudent = {
                    id: student.id,
                    name: student.name,
                    lastName: student.lastName,
                    enrollmentDate: student.enrollmentDate,
                    identification: student.identification,
                    birthday: student.birthday,
                }

                return {
                    ...parseStudent,
                    suggestedByMartialArt,
                    suggested: suggestedByMartialArt.some(item => item.suggested),
                };
            });

            return studentsSuggestion;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            badResponse.message = message;
            return badResponse;
        }
    }

    async createAppliedStudent(data: AppliedManyStudentsDto) {
        try {
            if (!data.appliedStudents?.length) {
                badResponse.message = 'Debe enviar al menos un estudiante para postular.';
                return badResponse;
            }

            const now = new Date();
            const minDate = new Date(now);
            minDate.setMonth(minDate.getMonth() - 8);

            const preparedApplications: Array<{
                activityId: number;
                userId: number;
                martialArtId: number;
                rankId: number;
            }> = [];

            for (const item of data.appliedStudents) {
                const findUser = await this.prismaService.users.findUnique({ where: { id: item.userId } });

                if (!findUser) {
                    badResponse.message = `Usuario con id ${item.userId} no encontrado.`;
                    return badResponse;
                }

                const ageUser = Math.floor((now.getTime() - findUser.birthday.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
                const validateEnrollment = findUser.enrollmentDate > minDate;

                if (validateEnrollment) {
                    badResponse.message = 'El usuario debe tener al menos 8 meses de inscripción en la escuela para ser postulado.';
                    return badResponse;
                }

                if (ageUser < 5) {
                    badResponse.message = 'El usuario debe tener al menos 5 años para ser postulado.';
                    return badResponse;
                }

                //Buscar su ultima postulacion en el arte marcial
                const findLastApplication = await this.prismaService.appliedStudents.findFirst({
                    where: {
                        userId: item.userId,
                        martialArtId: item.martialArtId,
                    },
                    orderBy: { createdAt: 'desc' },
                });

                //Buscar su ultimo examen aprobado en el arte marcial
                const findLastExam = await this.prismaService.exams.findFirst({
                    where: {
                        userId: item.userId,
                        martialArtId: item.martialArtId,
                        status: 'Aprobado',
                    },
                    orderBy: { createdAt: 'desc' },
                });

                //En caso de que no existan examenes, se busca el rango inicial segun el arte marcial
                const findFistRankPostulation = await this.prismaService.ranks.findFirst({
                    where: {
                        martialArtId: item.martialArtId,
                    },
                    orderBy: { id: 'asc' },
                });

                if (findLastExam && findLastExam.createdAt > minDate) {
                    badResponse.message = 'Para poder postular a esta actividad, deben haber pasado al menos 8 meses desde el último examen en esta arte marcial.';
                    return badResponse;
                }

                if (findLastApplication && findLastApplication.createdAt > minDate) {
                    badResponse.message = 'Ya existe una postulación reciente para este usuario y arte marcial. Por favor espera antes de postular nuevamente.';
                    return badResponse;
                }

                //Si es mayor a 12 años, el rango inicial es 2 (Cinturón Blanco Raya Amarillo), si es menor o igual a 12 años, el rango inicial es 1 (Blanco Punta Amarillo)
                const rankInitial = ageUser > 12 ? 2 : 1;

                //En caso de tener un examen registrado, se asigna al siguiente rango, de lo contrario, se asigna el rango inicial del arte marcial segun la edad del usuario
                const rankId = findLastExam ? findLastExam.ranksId + 1 : (Number(findFistRankPostulation?.id) + rankInitial) || 1;

                preparedApplications.push({
                    activityId: data.activityId,
                    userId: item.userId,
                    martialArtId: item.martialArtId,
                    rankId,
                });
            }

            const createdStudents = await this.prismaService.$transaction(
                preparedApplications.map(item =>
                    this.prismaService.appliedStudents.create({
                        data: {
                            activityId: item.activityId,
                            userId: item.userId,
                            martialArtId: item.martialArtId,
                            ranksId: item.rankId,
                        },
                        select: {
                            id: true,
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    lastName: true,
                                }
                            },
                            ranks: {
                                include: {
                                    martialArt: true,
                                }
                            },
                        }
                    })
                )
            );

            if (createdStudents.length === 1) {
                const created = createdStudents[0];
                baseResponse.data = created;
                baseResponse.message = `Estudiante ${created.user.name} ${created.user.lastName} postulado correctamente para el examen de ${created.ranks.martialArt.martialArt} a Cinturón ${created.ranks.belt} ${created.ranks.code}${created.ranks.rank_name ? ` (${created.ranks.rank_name})` : ''}`;
                return baseResponse;
            }

            const martialArts = [...new Set(createdStudents.map(item => item.ranks.martialArt.martialArt))];
            baseResponse.data = createdStudents;
            baseResponse.message = `Estudiantes aplicados correctamente para examenes de ${martialArts.join(' y ')}`;
            return baseResponse;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            badResponse.message = message;
            return badResponse;
        }
    }

    // async updateAppliedStudent(id: number, data: AppliedStudentDto) {
    //     try {
    //         const updated = await this.prismaService.appliedStudents.update({
    //             where: { id },
    //             data: {
    //                 activityId: data.activityId,
    //                 userId: data.userId,
    //                 martialArtId: data.martialArtId,
    //                 ranksId: data.ranksId,
    //             }
    //         });

    //         baseResponse.data = updated;
    //         baseResponse.message = 'Postulación actualizada correctamente';
    //         return baseResponse;
    //     } catch (error) {
    //         const message = error instanceof Error ? error.message : String(error);
    //         badResponse.message = message;
    //         return badResponse;
    //     }
    // }

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
