import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivityDto, ActivityFilterDto, AppliedStudentDto, ExamDto, ExamStudentsDto, MarkActivityAttendanceDto } from './activities.dto';

@Controller('activities')
export class ActivitiesController {

    constructor(private readonly activitiesService: ActivitiesService) { }

    @Get()
    getActivities(
        @Query('dojoId') dojoId?: string,
        @Query('date') date?: string,
        @Query('place') place?: string,
        @Query('name') name?: string,
    ) {
        const filters: ActivityFilterDto = {};
        if (dojoId) filters.dojoId = Number(dojoId);
        if (date) filters.date = new Date(date);
        if (place) filters.place = place;
        if (name) filters.name = name;
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
}
