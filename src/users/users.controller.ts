import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersDTO } from './users.dto';

@Controller('users')
export class UsersController {

    constructor(private userService : UsersService) {}

    @Get()
    async getAllUsers() {
        return await this.userService.getAllUsers();
    }

    @Get('/roles')
    async getRoles() {
        return await this.userService.getRoles();
    }

    @Post()
    async createUser(@Body() user : UsersDTO) {
        return await this.userService.createUser(user);
    }

}
