import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { badResponse, baseResponse } from '../utilities/base.dto';
import { UsersDTO } from './users.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()

export class UsersService {

    constructor(
        private prismaService: PrismaService
    ) { }

    async getUsers(
        dojoId?: string,
        search?: string,
        deleted?: boolean,
    ) {
        const where: any = {};

        if (dojoId) {
            where.dojoId = Number(dojoId);
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { identification: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } },
            ];
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
                where
            });
            return users;
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

    async createUser(user: UsersDTO) {
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
                    dojoId: user.dojoId,
                    rolId: user.rolId,
                    birthday: user.birthday,
                    profileImg: user.profileImg,
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

    async updateUser(user: UsersDTO, id: number) {
        try {
            await this.prismaService.users.update({
                data: {
                    identification: user.identification,
                    name: user.name,
                    lastName: user.lastName,
                    email: user.email,
                    username: user.username,
                    address: user.address,
                    phone: user.phone,
                    birthday: user.birthday,
                    profileImg: user.profileImg,
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
