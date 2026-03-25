import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // Pintu 1: Membuat Kelas (Khusus Guru)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TEACHER')
  @Post()
  create(@Body() createCourseDto: CreateCourseDto, @Request() req) {
    const authorId = req.user.userId;
    return this.coursesService.create(createCourseDto, authorId);
  }

  // Pintu 2: Etalase Kelas (Bebas untuk semua yang punya tiket JWT)
  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.coursesService.findAll();
  }
  // Pintu 3: Mengubah Kelas (Hanya untuk pemiliknya)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TEACHER')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @Request() req,
  ) {
    const authorId = req.user.userId;
    return this.coursesService.update(id, updateCourseDto, authorId);
  }
  // Pintu 4: Menghapus Kelas (Hanya untuk pemiliknya)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TEACHER')
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const authorId = req.user.userId;
    return this.coursesService.remove(id, authorId);
  }
}
