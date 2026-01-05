import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { DojosService } from './dojos.service';
import { DojoDto, ScheduleDojoDTO } from './dojo.dto';

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
}
