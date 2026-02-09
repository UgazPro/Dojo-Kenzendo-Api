import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UserPassword, UsersDTO } from './users.dto';
import { Roles } from '@/guards/roles/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import * as fs from 'fs';

@Controller('users')
export class UsersController {

    constructor(private userService: UsersService) { }

    @Get()
    async getUsers(
        @CurrentUser() user,
        @Query('dojoId') dojoId: string,
        @Query('userId') userId: string,
        @Query('deleted') deleted: string,
    ) {
        return await this.userService.getUsers(user, dojoId, userId, deleted === 'true');
    }

    @Get('/info')
    async getInfoUser(@CurrentUser() user) {
        return await this.userService.getInfoUser(user);
    }

    // @Roles('Administrador', 'Líder Instructor', 'Instructor')
    @Get('/detail/:id')
    async getAllInfoByUser(@Param('id', ParseIntPipe) id: number, @CurrentUser() user) {
        return await this.userService.getAllInfoByUser(id, user);
    }

    @Get('/roles')
    async getRoles(@CurrentUser() user) {
        return await this.userService.getRoles(user);
    }

    @Get('/form')
    async getUserFormOptions(@CurrentUser() user) {
        return await this.userService.getUserFormOptions(user);
    }

    @Post()
    @UseInterceptors(FileInterceptor('profileImg', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = join(__dirname, '..', '..', '..', 'uploads', 'users');
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const original = file.originalname;
                const safeName = original.replace(/[^a-zA-Z0-9.\-_]/g, '_');
                cb(null, safeName);
            }
        }),
        limits: { files: 1 },
        fileFilter: (req, file, cb) => {
            const uploadPath = join(__dirname, '..', '..', '..', 'uploads', 'users');
            const original = file.originalname;
            const safeName = original.replace(/[^a-zA-Z0-9.\-_]/g, '_');
            const fullPath = join(uploadPath, safeName);
            if (fs.existsSync(fullPath)) {
                req.existingFile = `/api/public/uploads/users/${safeName}`;
                return cb(null, false);
            }
            cb(null, true);
        }
    }))
    async createUser(
        @Req() req: any, 
        @Body() newUser: UsersDTO, 
        @CurrentUser() user,
        @UploadedFile() file?: Express.Multer.File, 
        ) {
        const profileImg = file ? `/api/public/uploads/users/${file.filename}` : (req.existingFile || '');

        return await this.userService.createUser(newUser, profileImg, user);
    }

    @Put('/:id')
    @UseInterceptors(FileInterceptor('profileImg', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = join(__dirname, '..', '..', '..', 'uploads', 'users');
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const original = file.originalname;
                const safeName = original.replace(/[^a-zA-Z0-9.\-_]/g, '_');
                cb(null, safeName);
            }
        }),
        limits: { files: 1 },
        fileFilter: (req, file, cb) => {
            const uploadPath = join(__dirname, '..', '..', '..', 'uploads', 'users');
            const original = file.originalname;
            const safeName = original.replace(/[^a-zA-Z0-9.\-_]/g, '_');
            const fullPath = join(uploadPath, safeName);
            if (fs.existsSync(fullPath)) {
                req.existingFile = `/api/public/uploads/users/${safeName}`;
                return cb(null, false);
            }
            cb(null, true);
        }
    }))
    async updateUser(
        @Req() req: any,
        @Param('id', ParseIntPipe) 
        id: number, @Body() user: UsersDTO, 
        @UploadedFile() file?: Express.Multer.File) {
        const profileImg = file ? `/api/public/uploads/users/${file.filename}` : (req.existingFile || '');
        return await this.userService.updateUser(user, id, profileImg);
    }

    @Put('/change-password')
    async changePassword(@Body() password: UserPassword) {
        return await this.userService.updateUserPassword(password.password, password.id);
    }

    @Delete('/:id')
    async deleteUser(@Param('id', ParseIntPipe) id: number) {
        return await this.userService.deleteUser(id);
    }

}
