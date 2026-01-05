import { Body, Controller, Param, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthDTO, LoginDTO } from './auth.dto';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Post('/login')
    async login(@Body() credentials: LoginDTO) {
        return await this.authService.login(credentials);
    }

    @Post('/google')
    async googleAuth(@Body('token') token: string) {
        // Recibimos el token del frontend y lo procesamos
        return await this.authService.authenticateWithGoogle(token);
    }

    @Post('/complete-profile/:id')
    async completeProfile(@Body() userData: GoogleAuthDTO, @Param('id') id: number) {
        return await this.authService.updateGoogleAuth(id, userData);
    }
}
