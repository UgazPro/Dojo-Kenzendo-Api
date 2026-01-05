import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersDTO } from './users.dto';

@Controller('users')
export class UsersController {

    constructor(private userService: UsersService) { }

    @Get()
    async getUsers(
        @Query('dojoId') dojoId: string,
        @Query('search') search: string,
        @Query('deleted') deleted: string,
    ) {
        return await this.userService.getUsers(dojoId, search, deleted === 'true');
    }

    @Get('/roles')
    async getRoles() {
        return await this.userService.getRoles();
    }

    @Get('/form')
    async getUserFormOptions() {
        return await this.userService.getUserFormOptions();
    }

    @Post()
    async createUser(@Body() user: UsersDTO) {
        return await this.userService.createUser(user);
    }

    @Put('/:id')
    async updateUser(@Param('id', ParseIntPipe) id: number, @Body() user: UsersDTO) {
        return await this.userService.updateUser(user, id);
    }

    @Delete('/:id')
    async deleteUser(@Param('id', ParseIntPipe) id: number) {
        return await this.userService.deleteUser(id);
    }

}
