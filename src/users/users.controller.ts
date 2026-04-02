import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // POST /users/register — Daftar akun baru
  @Post('register')
  @ApiOperation({ summary: 'Daftar akun baru (STUDENT/TEACHER)' })
  @ApiResponse({ status: 201, description: 'Akun berhasil dibuat' })
  @ApiResponse({ status: 409, description: 'Email sudah terdaftar' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // GET /users/profile — Lihat profil sendiri (semua role)
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lihat profil user yang sedang login' })
  @ApiResponse({ status: 200, description: 'Data profil berhasil diambil' })
  @ApiResponse({ status: 401, description: 'Token tidak valid atau tidak ada' })
  getProfile(@Request() req: any) {
    return {
      message: 'Selamat datang di area member!',
      user: req.user,
    };
  }

  // GET /users/teacher-area — Area khusus TEACHER
  @Get('teacher-area')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TEACHER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Area eksklusif khusus TEACHER' })
  @ApiResponse({ status: 200, description: 'Akses diberikan' })
  @ApiResponse({ status: 403, description: 'Bukan TEACHER' })
  getTeacherArea(@Request() req: any) {
    return {
      message: 'Akses Diberikan: Selamat datang di Ruang Guru!',
      user: req.user,
    };
  }
}
