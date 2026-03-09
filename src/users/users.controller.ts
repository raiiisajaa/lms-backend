import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport'; // Satpam Lapis 1 (Tiket)
import { RolesGuard } from '../auth/guards/roles.guard'; // Satpam Lapis 2 (Pangkat)
import { Roles } from '../auth/decorators/roles.decorator'; // Stempel Izin

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // Pintu 1: Boleh untuk siapa saja (asal bawa tiket JWT)
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return {
      message: 'Selamat datang di area member!',
      user: req.user,
    };
  }

  // Pintu 2: SANGAT RAHASIA (Hanya untuk Guru)
  @UseGuards(AuthGuard('jwt'), RolesGuard) // Pasang 2 satpam berjejer!
  @Roles('TEACHER') // Tempelkan stempel bahwa pintu ini hanya untuk TEACHER
  @Get('teacher-area')
  getTeacherArea(@Request() req) {
    return {
      message: 'Akses Diberikan: Selamat datang di Ruang Guru!',
      user: req.user,
    };
  }
}
