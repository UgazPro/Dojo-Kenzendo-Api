import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { badResponse, baseResponse } from '../utilities/base.dto';
import { UsersDTO, UserTokenDecode } from './users.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()

export class UsersService {

    constructor(
        private prismaService: PrismaService
    ) { }

    async getUsers(
        user: UserTokenDecode,
        dojoId?: string,
        userId?: string,
        deleted?: boolean,
    ) {
        const where: any = {};

        if (user.rol && user.rol.rol !== 'Administrador') {
            where.dojoId = user.dojoId;
        } else {
            if (dojoId) {
                where.dojoId = Number(dojoId);
            }
        }

        if (userId) {
            where.id = Number(userId);
        }

        if (!deleted) {
            where.deleted = false;
        }

        try {
            const users = await this.prismaService.users.findMany({
                include: {
                    rol: true,
                    dojo: {
                        select: {
                            dojo: true,
                            id: true,
                        }
                    },
                    userRanks: {
                        select: {
                            martialArt: true,
                            rank: {
                                select: {
                                    id: true,
                                    rank_name: true,
                                    belt: true,
                                    icon: true,
                                    code: true,
                                }
                            }
                        }
                    }
                },
                where: {
                    id: { not: user.id },
                    ...where,
                },
                orderBy: {
                    id: 'asc',
                }
            });
            return users;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            badResponse.message = message;
            return badResponse;
        }
    }

    async getInfoUser(user: UserTokenDecode) {
        try {
            const userId = user.id;
            if (!userId) {
                badResponse.message = 'Usuario no encontrado en token';
                return badResponse;
            }

            const userFound = await this.prismaService.users.findUnique({
                where: { id: userId },
                include: {
                    rol: true,
                    dojo: {
                        select: { dojo: true, id: true }
                    },
                    userRanks: {
                        select: {
                            martialArt: true,
                            rank: {
                                select: {
                                    id: true,
                                    rank_name: true,
                                    belt: true,
                                    icon: true,
                                    code: true,
                                }
                            }
                        }
                    }
                }
            });

            if (!userFound) {
                badResponse.message = 'Usuario no existe';
                return badResponse;
            }

            return userFound;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            badResponse.message = message;
            return badResponse;
        }
    }

    async getAllInfoByUser(id: number, user: UserTokenDecode) {
        try {
            const roles = ['Administrador', 'Líder Instructor', 'Instructor'];
            const findUser = await this.prismaService.users.findUnique({
                where: { id },
                select: {
                    dojoId: true,
                    id: true,
                }
            });

            if (!findUser) {
                badResponse.message = 'Usuario no existe';
                return badResponse;
            }

            if (findUser?.dojoId !== user.dojoId && !roles.includes(user.rol.rol)) {
                badResponse.message = 'No tienes permiso para ver este usuario';
                return badResponse;
            }
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

            const [
                dojoAttendance,
                userAttendance,
                paymentsThisMonth,
                exams,
                appliedStudents,
                upcomingExamActivity,
                activityAttendanceHistory,
            ] = await Promise.all([
                this.prismaService.dojoAttendance.findMany({
                    where: {
                        dojoId: findUser.dojoId,
                        attendanceDate: {
                            gte: startOfMonth,
                            lte: endOfMonth,
                        }
                    },
                    select: {
                        scheduleId: true,
                        attendanceDate: true,
                    }
                }),
                this.prismaService.dojoAttendance.findMany({
                    where: {
                        userId: findUser.id,
                        attendanceDate: {
                            gte: startOfMonth,
                            lte: endOfMonth,
                        }
                    },
                    select: {
                        scheduleId: true,
                        attendanceDate: true,
                    }
                }),
                this.prismaService.payments.findMany({
                    where: {
                        userId: findUser.id,
                        payment_date: {
                            gte: startOfMonth,
                            lte: endOfMonth,
                        }
                    },
                    select: {
                        id: true,
                        payment_date: true,
                        amount: true,
                    }
                }),
                this.prismaService.exams.findMany({
                    where: { userId: findUser.id },
                    include: {
                        activity: true,
                        martialArt: true,
                        ranks: true,
                    }
                }),
                this.prismaService.appliedStudents.findMany({
                    where: { userId: findUser.id },
                    include: {
                        activity: true,
                        martialArt: true,
                        ranks: true,
                    }
                }),
                this.prismaService.activities.findFirst({
                    where: {
                        date: { gt: now },
                        AppliedStudents: {
                            some: { userId: findUser.id }
                        }
                    },
                    orderBy: { date: 'asc' },
                }),
                this.prismaService.activityAttendance.findMany({
                    where: { userId: findUser.id },
                    include: { activity: true },
                    orderBy: { activity: { date: 'desc' } }
                }),
            ]);

            const normalizeDate = (date: Date) => new Date(date).toISOString().split('T')[0];

            const dojoSessions = new Set(
                dojoAttendance.map(item => `${item.scheduleId}-${normalizeDate(item.attendanceDate)}`),
            );

            const userSessions = new Set(
                userAttendance.map(item => `${item.scheduleId}-${normalizeDate(item.attendanceDate)}`),
            );

            const attendancePercentage = dojoSessions.size > 0
                ? Number(((userSessions.size / dojoSessions.size) * 100).toFixed(2))
                : 0;

            const paymentsUpToDate = paymentsThisMonth.length > 0;

            const approvedExamKeys = new Set(
                exams.map(exam => `${exam.activityId}-${exam.martialArtId}-${exam.ranksId}`),
            );

            const appliedExamKeys = new Set(
                appliedStudents.map(applied => `${applied.activityId}-${applied.martialArtId}-${applied.ranksId}`),
            );

            const examsHistory = appliedStudents.map(applied => {
                const key = `${applied.activityId}-${applied.martialArtId}-${applied.ranksId}`;
                const approved = approvedExamKeys.has(key);
                return {
                    activity: applied.activity,
                    martialArt: applied.martialArt,
                    rank: applied.ranks,
                    approved,
                };
            });

            const approvedOnly = exams
                .filter(exam => {
                    const key = `${exam.activityId}-${exam.martialArtId}-${exam.ranksId}`;
                    return !appliedExamKeys.has(key);
                })
                .map(exam => ({
                    activity: exam.activity,
                    martialArt: exam.martialArt,
                    rank: exam.ranks,
                    approved: true,
                }));

            return {
                attendancePercentage,
                paymentStatus: paymentsUpToDate ? 'AL_DIA' : 'DEUDA',
                examsHistory: [...examsHistory, ...approvedOnly],
                upcomingExam: upcomingExamActivity ?? null,
                activityAttendanceHistory,
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            badResponse.message = message;
            return badResponse;
        }
    }

    async getRoles(user: UserTokenDecode) {
        try {
            const roles = await this.prismaService.roles.findMany({
                where: {
                    id: { gt: user.rolId },
                }
            });
            return roles;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            badResponse.message = message;
            return badResponse;
        }
    }

    async getUserFormOptions(user: UserTokenDecode) {
        try {
            const [
                roles,
                dojos,
                martialArt,
                ranks,
            ] = await Promise.all([
                this.prismaService.roles.findMany({
                    where: {
                        id: { gt: user.rolId },
                    }
                }),
                this.prismaService.dojos.findMany({
                    select: { id: true, dojo: true }
                }),
                this.prismaService.martialArts.findMany(),
                this.prismaService.ranks.findMany({
                    select: { id: true, code: true, rank_name: true, belt: true, }
                }),
            ]);

            return {
                roles,
                dojos,
                martialArt,
                ranks,
            }

        } catch {
            badResponse.message = 'Error al obtener las opciones del formulario';
            return badResponse;
        }
    }

    async createUser(user: UsersDTO, profileImg: string, currentUser: UserTokenDecode) {
        try {
            const dojoId = currentUser.rol.rol === 'Administrador' ? user.dojoId : currentUser.dojoId;
            const hashed = await bcrypt.hash(user.identification, 10);
            const userCreated = await this.prismaService.users.create({
                data: {
                    identification: user.identification,
                    name: user.name,
                    lastName: user.lastName,
                    password: hashed,
                    email: user.email,
                    username: user.username,
                    address: user.address,
                    phone: user.phone,
                    sex: user.sex,
                    dojoId: dojoId,
                    rolId: user.rolId,
                    birthday: user.birthday,
                    profileImg: profileImg,
                    active: true,
                    deleted: false,
                    enrollmentDate: user.enrollmentDate,
                }
            });

            await this.prismaService.userRanks.createMany({
                data: user.martialArtRank.map(maritalArtRank => ({
                    userId: userCreated.id,
                    martialArtId: maritalArtRank.martialArtId,
                    currentRankId: maritalArtRank.rankId,
                }))
            })

            baseResponse.message = 'Usuario creado correctamente';
            return baseResponse;

        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            badResponse.message = message;
            return badResponse;
        }
    }

    async updateUserPassword(password: string, id: number) {
        try {
            const hashed = await bcrypt.hash(password, 10);
            await this.prismaService.users.update({
                data: {
                    password: hashed,
                },
                where: {
                    id: id,
                }
            });
            baseResponse.message = 'Contraseña actualizada correctamente';
            return baseResponse;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            badResponse.message = message;
            return badResponse;
        }
    }

    async updateUser(user: UsersDTO, id: number, profileImg: string) {
        try {
            await this.prismaService.users.update({
                data: {
                    identification: user.identification,
                    name: user.name,
                    lastName: user.lastName,
                    email: user.email,
                    sex: user.sex,
                    username: user.username,
                    address: user.address,
                    phone: user.phone,
                    birthday: user.birthday,
                    profileImg: profileImg,
                },
                where: {
                    id: id,
                }
            });

            await this.prismaService.userRanks.updateMany({
                where: { userId: id },
                data: {
                    currentRankId: user.martialArtRank[0].rankId,
                }
            })

            baseResponse.message = 'Usuario actualizado correctamente';
            return baseResponse;

        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            badResponse.message = message;
            return badResponse;
        }
    }

    async deleteUser(id: number) {
        try {
            await this.prismaService.users.update({
                data: {
                    deleted: true,
                    active: false,
                },
                where: {
                    id: id,
                }
            });
            baseResponse.message = 'Usuario eliminado correctamente';
            return baseResponse;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            badResponse.message = message;
            return badResponse;
        }
    }
}
