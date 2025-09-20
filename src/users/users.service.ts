import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { badResponse, baseResponse } from 'src/utilities/base.dto';
import { UsersDTO } from './users.dto';

@Injectable()

export class UsersService {

    constructor(
        private prismaService: PrismaService
    ) {}

    async getAllUsers() {
        try {
            const users = await this.prismaService.users.findMany({
                include: {
                    rol: true,
                    dojo: true,
                },
            });
            return users;
        } catch (error) {
            badResponse.message = error.message;
            return badResponse;
        }
    }

    async createUser(user : UsersDTO) {
        try {
            
            await this.prismaService.users.create({
                data: {                            
                    identification: user.identification,
                    name: user.name ,               
                    lastName: user.lastName ,           
                    password: user.identification ,           
                    email: user.email ,              
                    username: user.username ,           
                    address: user.address ,            
                    phone: user.phone ,              
                    dojoId: user.dojoId ,             
                    rolId: user.rolId ,              
                    birthday: user.birthday ,           
                    profileImg: user.profileImg ,    
                    active: true,
                    deleted: false,
                    enrollmentDate: new Date(),     
                }
            });

            baseResponse.message = 'Usuario creado correctamente';
            return baseResponse;

        } catch (error) {
            badResponse.message = error.message;
            return badResponse;
        }
    }

    async updateUser(user : UsersDTO, id: number) {
        try {
            
            await this.prismaService.users.update({
                data: {                            
                    identification: user.identification,
                    name: user.name ,               
                    lastName: user.lastName ,                      
                    email: user.email ,              
                    username: user.username ,           
                    address: user.address ,            
                    phone: user.phone ,                         
                    birthday: user.birthday ,           
                    profileImg: user.profileImg ,         
                },    
                where: {
                    id: id,
                }
            });

            baseResponse.message = 'Usuario actualizado correctamente';
            return baseResponse;

        } catch (error) {
            badResponse.message = error.message;
            return badResponse;
        }
    }

}
