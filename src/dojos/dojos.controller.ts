import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { DojosService } from './dojos.service';
import { AttendanceFilter, DojoDto, DojoImagesDto, MarkAttendanceDto, ScheduleDojoDTO } from './dojo.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

@Controller('dojos')
export class DojosController {

    constructor(private readonly dojosService: DojosService) {

    }

    @Get()
    getDojos(
        @Query('dojoId') dojoId?: string,
        @Query('name') name?: string,
        @Query('address') address?: string) {
        return this.dojosService.getDojos(dojoId, name, address);
    }

    @Post()
    createDojo(@Body() dojoData: DojoDto) {
        return this.dojosService.createDojo(dojoData);
    }

    @Put()
    updateDojo(@Param('id', ParseIntPipe) id: number, @Body() dojoData: DojoDto) {
        return this.dojosService.updateDojo(dojoData, id);
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
        @Body('dojoId', ParseIntPipe) dojoId: number,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        const urls = files.map(file => `/uploads/dojos/${file.filename}`);
        const payload: DojoImagesDto = { dojoId, urls };
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

    @Get('/attendance/current-class/:dojoId')
    async getCurrentClass(@Param('dojoId') dojoId: string) {
        const schedule = await this.dojosService.getCurrentSchedule(+dojoId);
        if (!schedule) throw new BadRequestException('No hay clases activas en este momento');
        return schedule;
    }

    @Post('/attendance/mark')
    async mark(@Body() markAttendanceDto: MarkAttendanceDto) {
        return this.dojosService.markBulkAttendance(markAttendanceDto);
    }
}
