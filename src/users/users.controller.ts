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
import { AuthGuard } from '@nestjs/passport'; // Import gembok satpam

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // Rute Rahasia: GET http://localhost:3000/users/profile
  @UseGuards(AuthGuard('jwt')) // <-- INI ADALAH GEMBOK PENJAGANYA!
  @Get('profile')
  getProfile(@Request() req) {
    // req.user berisi data yang berhasil diekstrak oleh JwtStrategy tadi
    return {
      message: 'Selamat datang di area rahasia!',
      user: req.user,
    };
  }
}
