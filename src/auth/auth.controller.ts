import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './auth.dto';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @Post('/login')
    async login(@Body() credentials: LoginDTO) {
        return await this.authService.login(credentials);

    }
}
