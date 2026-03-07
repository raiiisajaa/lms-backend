import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../users/dto/login.dto';

// Rute utama: http://localhost:3000/auth
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Rute spesifik: POST http://localhost:3000/auth/login
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() loginDto: LoginDto) {
    // Memberikan email dan password dari user ke ruang mesin (Service)
    return this.authService.login(loginDto.email, loginDto.password);
  }
}
