import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivityDto, ActivityFilterDto, ActivityImagesDto, AppliedStudentDto, ExamDto, ExamStudentsDto, MarkActivityAttendanceDto } from './activities.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

@Controller('activities')
export class ActivitiesController {

    constructor(private readonly activitiesService: ActivitiesService) { }

    @Get()
    getActivities(
        @Query('dojoId') dojoId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('place') place?: string,
        @Query('name') name?: string,
        @Query('includePast') includePast?: string,
    ) {
        const filters: ActivityFilterDto = {};
        if (dojoId) filters.dojoId = Number(dojoId);
        if (startDate) filters.startDate = new Date(startDate);
        if (endDate) filters.endDate = new Date(endDate);
        if (place) filters.place = place;
        if (name) filters.name = name;
        if (includePast !== undefined) filters.includePast = includePast === 'true';
        return this.activitiesService.getActivities(filters);
    }

    @Get('/current')
    getCurrentActivity(@Query('dojoId') dojoId?: string) {
        return this.activitiesService.getCurrentActivity(dojoId ? Number(dojoId) : undefined);
    }

    @Post()
    createActivity(@Body() activity: ActivityDto) {
        return this.activitiesService.createActivity(activity);
    }

    @Put('/:id')
    updateActivity(
        @Param('id', ParseIntPipe) id: number,
        @Body() activity: ActivityDto,
    ) {
        return this.activitiesService.updateActivity(id, activity);
    }

    // Attendance
    @Get('/attendance/:activityId')
    getActivityAttendance(@Param('activityId', ParseIntPipe) activityId: number) {
        return this.activitiesService.getActivityAttendance(activityId);
    }

    @Post('/attendance/mark')
    markActivityAttendance(@Body() data: MarkActivityAttendanceDto) {
        return this.activitiesService.markActivityAttendance(data);
    }

    // Exams
    @Get('/exams')
    getExams(
        @Query('activityId') activityId?: string,
        @Query('userId') userId?: string,
        @Query('martialArtId') martialArtId?: string,
    ) {
        return this.activitiesService.getExams(
            activityId ? Number(activityId) : undefined,
            userId ? Number(userId) : undefined,
            martialArtId ? Number(martialArtId) : undefined,
        );
    }

    @Post('/exams')
    createExam(@Body() exam: ExamStudentsDto) {
        return this.activitiesService.createExam(exam);
    }

    @Put('/exams/:id')
    updateExam(
        @Param('id', ParseIntPipe) id: number,
        @Body() exam: ExamDto,
    ) {
        return this.activitiesService.updateExam(id, exam);
    }

    // Applied students (postulaciones)
    @Get('/applied-students')
    getAppliedStudents(
        @Query('activityId') activityId?: string,
        @Query('userId') userId?: string,
        @Query('martialArtId') martialArtId?: string,
    ) {
        return this.activitiesService.getAppliedStudents(
            activityId ? Number(activityId) : undefined,
            userId ? Number(userId) : undefined,
            martialArtId ? Number(martialArtId) : undefined,
        );
    }

    @Post('/applied-students')
    createAppliedStudent(@Body() data: AppliedStudentDto) {
        return this.activitiesService.createAppliedStudent(data);
    }

    @Put('/applied-students/:id')
    updateAppliedStudent(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: AppliedStudentDto,
    ) {
        return this.activitiesService.updateAppliedStudent(id, data);
    }

    // Images
    @Get('/images/:activityId')
    getActivityImages(@Param('activityId', ParseIntPipe) activityId: number) {
        return this.activitiesService.getActivityImages(activityId);
    }

    @Post('/images')
    @UseInterceptors(FilesInterceptor('images', 10, {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = join(__dirname, '..', '..', '..', 'uploads', 'activities');
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
    addActivityImages(
        @Body('activityId', ParseIntPipe) activityId: number,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        const urls = files.map(file => `/uploads/activities/${file.filename}`);
        const payload: ActivityImagesDto = { activityId, urls };
        return this.activitiesService.addActivityImages(payload);
    }

    @Delete('/images/:id')
    deleteActivityImage(@Param('id', ParseIntPipe) id: number) {
        return this.activitiesService.deleteActivityImage(id);
    }
}
