import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UploadedFile, UploadedFiles, UseInterceptors, Req } from '@nestjs/common';
import { DojosService } from './dojos.service';
import { AttendanceFilter, DojoDto, DojoImagesDto, MarkAttendanceDto, ScheduleDojoDTO } from './dojo.dto';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserTokenDecode } from '@/users/users.dto';

@Controller('dojos')
export class DojosController {
    private parseDojoData(dojoDataRaw: string): DojoDto {
        try {
            return JSON.parse(dojoDataRaw) as DojoDto;
        } catch {
            throw new BadRequestException('El campo dojoData debe ser un JSON valido');
        }
    }


    constructor(private readonly dojosService: DojosService) {

    }

    @Get()
    getDojos(
        @Query('dojoId') dojoId?: string,
    ) {
        return this.dojosService.getDojos(dojoId);
    }

    @Get('/info/:code')
    getFullInfoDojo(
        @Param('code') code: string,
    ) {
        return this.dojosService.getFullInfoDojo(code);
    }

    @Get('/martial-arts')
    async getMartialArts(@CurrentUser() user) {
        return await this.dojosService.getMartialArts(user);
    }

    @Get('/ranks')
    async getRanks() {
        return await this.dojosService.getRanks();
    }

    @Post()
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'logo', maxCount: 1 },
        { name: 'banner', maxCount: 1 },
    ], {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = join(__dirname, '..', '..', '..', 'uploads', 'dojos');
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
        limits: { files: 2 },
        fileFilter: (req, file, cb) => {
            const uploadPath = join(__dirname, '..', '..', '..', 'uploads', 'dojos');
            const original = file.originalname;
            const safeName = original.replace(/[^a-zA-Z0-9.\-_]/g, '_');
            const fullPath = join(uploadPath, safeName);
            if (fs.existsSync(fullPath)) {
                req.existingFiles = req.existingFiles || {};
                req.existingFiles[file.fieldname] = `/uploads/dojos/${safeName}`;
                return cb(null, false);
            }
            cb(null, true);
        }
    }))
    createDojo(
        @Req() req: any,
        @Body('dojoData') dojoDataRaw: string,
        @UploadedFiles() files: { logo?: Express.Multer.File[], banner?: Express.Multer.File[] },
    ) {
        const dojoData = this.parseDojoData(dojoDataRaw);
        const logo = files?.logo?.[0]
            ? `/uploads/dojos/${files.logo[0].filename}`
            : (req.existingFiles?.logo || '');
        const banner = files?.banner?.[0]
            ? `/uploads/dojos/${files.banner[0].filename}`
            : (req.existingFiles?.banner || '');

        if (!logo) {
            throw new BadRequestException('El logo es obligatorio y no fue enviado en form-data con la clave "logo"');
        }

        return this.dojosService.createDojo(dojoData, logo, banner);
    }

    @Put('/:id')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'logo', maxCount: 1 },
        { name: 'banner', maxCount: 1 },
    ], {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = join(__dirname, '..', '..', '..', 'uploads', 'dojos');
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
        fileFilter: (req, file, cb) => {
            const uploadPath = join(__dirname, '..', '..', '..', 'uploads', 'dojos');
            const original = file.originalname;
            const safeName = original.replace(/[^a-zA-Z0-9.\-_]/g, '_');
            const fullPath = join(uploadPath, safeName);
            if (fs.existsSync(fullPath)) {
                req.existingFiles = req.existingFiles || {};
                req.existingFiles[file.fieldname] = `/uploads/dojos/${safeName}`;
                return cb(null, false);
            }
            cb(null, true);
        }
    }))
    updateDojo(
        @Req() req: any,
        @Param('id', ParseIntPipe) id: number,
        @Body('dojoData') dojoDataRaw: string,
        @UploadedFiles() files: { logo?: Express.Multer.File[], banner?: Express.Multer.File[] },
    ) {
        const dojoData = this.parseDojoData(dojoDataRaw);
        const logo = files?.logo?.[0]
            ? `/uploads/dojos/${files.logo[0].filename}`
            : req.existingFiles?.logo;
        const banner = files?.banner?.[0]
            ? `/uploads/dojos/${files.banner[0].filename}`
            : req.existingFiles?.banner;

        return this.dojosService.updateDojo(dojoData, id, logo, banner);
    }

    @Delete('/:id')
    deleteDojo(@Param('id', ParseIntPipe) id: number) {
        return this.dojosService.deleteDojo(id);
    }

    @Get('/schedules')
    getScheduleDojo(@Query('dojoId') dojoId?: string) {
        return this.dojosService.getScheduleDojo(dojoId);
    }

    @Post('/schedules')
    createScheduleDojo(@Body() schedule: ScheduleDojoDTO) {
        return this.dojosService.createScheduleDojo(schedule);
    }

    @Put('/schedules')
    updateScheduleDojo(@Body() schedule: ScheduleDojoDTO) {
        return this.dojosService.updateScheduleDojo(schedule);
    }

    @Delete('/schedules/:id')
    deleteScheduleDojo(@Param('id', ParseIntPipe) id: number) {
        return this.dojosService.deleteScheduleDojo(id);
    }

    // Images
    @Get('/images/:dojoId')
    getDojoImages(@Param('dojoId', ParseIntPipe) dojoId: number) {
        return this.dojosService.getDojoImages(dojoId);
    }

    @Post('/images')
    @UseInterceptors(FilesInterceptor('images', 10, {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = join(__dirname, '..', '..', '..', 'uploads', 'dojos');
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
                cb(null, uniqueName);
            }
        })
    }))
    addDojoImages(
        @Query('dojoId', ParseIntPipe) dojoId: number,
        @Query('type') type: string,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        const urls = files.map(file => `/uploads/dojos/${file.filename}`);
        const payload: DojoImagesDto = { dojoId, type, urls };
        return this.dojosService.addDojoImages(payload);
    }

    @Delete('/images/:id')
    deleteDojoImage(@Param('id', ParseIntPipe) id: number) {
        return this.dojosService.deleteDojoImage(id);
    }

    //Attendance

    @Post('/attendance')
    async getAttendanceDojo(@Body() attendanceDojo: AttendanceFilter) {
        return await this.dojosService.getAttendanceDojo(attendanceDojo);
    }

    @Get('/attendance/current-class')
    async getCurrentClass(@CurrentUser() user: UserTokenDecode) {
        const schedule = await this.dojosService.getCurrentSchedule(user.dojoId);
        if (!schedule) throw new BadRequestException('No hay clases activas en este momento');
        return schedule;
    }

    @Post('/attendance/mark')
    async mark(@CurrentUser() user: UserTokenDecode, @Body() markAttendanceDto: MarkAttendanceDto) {
        return this.dojosService.markBulkAttendance(markAttendanceDto, user);
    }
}
