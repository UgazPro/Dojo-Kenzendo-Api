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
            badResponse.message = error.message;
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
            badResponse.message = error.message;
            return badResponse;
        }
    }

    async getAllInfoByUser(id: number, user: UserTokenDecode) {
        try {
            const roles = ['Administrador', 'Lider Instructor', 'Instructor'];

            const findUser = await this.prismaService.users.findUnique({
                where: { id },
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
                                    rank_name: true,
                                    belt: true,
                                    icon: true,
                                    code: true,
                                }
                            }
                        }
                    },
                    DojoAttendance: {
                        select: {
                            attendanceDate: true,
                            scheduleId: true,
                        }
                    },
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

            const dojoAttendance = await this.prismaService.dojoAttendance.findMany({
                where: { dojoId: findUser.dojoId },
                select: {
                    scheduleId: true,
                    attendanceDate: true,
                }
            });

            const normalizeDate = (date: Date) => new Date(date).toISOString().split('T')[0];

            const dojoSessions = new Set(
                dojoAttendance.map(item => `${item.scheduleId}-${normalizeDate(item.attendanceDate)}`),
            );

            const userSessions = new Set(
                (findUser.DojoAttendance ?? []).map(item => `${item.scheduleId}-${normalizeDate(item.attendanceDate)}`),
            );

            const attendancePercentage = dojoSessions.size > 0
                ? Number(((userSessions.size / dojoSessions.size) * 100).toFixed(2))
                : 0;

            return {
                ...findUser,
                attendanceStats: {
                    totalAttendances: findUser.DojoAttendance?.length ?? 0,
                    totalSessions: dojoSessions.size,
                    attendancePercentage,
                },
            };
        } catch (error) {
            badResponse.message = error.message;
            return badResponse;
        }
    }

    async getRoles() {
        try {
            const roles = await this.prismaService.roles.findMany();
            return roles;
        } catch (err) {
            badResponse.message = err.message;
            return badResponse;
        }
    }

    async getUserFormOptions() {
        try {
            const [
                roles,
                dojos,
                martialArt,
                ranks,
            ] = await Promise.all([
                this.prismaService.roles.findMany(),
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

    async createUser(user: UsersDTO, profileImg: string) {
        try {
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
                    dojoId: user.dojoId,
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
            badResponse.message = error.message;
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
            badResponse.message = error.message;
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
            badResponse.message = error.message;
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
            badResponse.message = error.message;
            return badResponse;
        }
    }
}
