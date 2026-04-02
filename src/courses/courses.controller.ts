import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Courses')
@ApiBearerAuth()
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // POST /courses — Buat kelas baru (khusus TEACHER)
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TEACHER')
  @ApiOperation({ summary: 'Buat kelas baru (khusus TEACHER)' })
  @ApiResponse({ status: 201, description: 'Kelas berhasil dibuat' })
  @ApiResponse({ status: 403, description: 'Bukan TEACHER' })
  create(@Body() createCourseDto: CreateCourseDto, @Request() req: any) {
    return this.coursesService.create(createCourseDto, req.user.userId);
  }

  // GET /courses — Lihat semua kelas
  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Lihat semua kelas yang tersedia' })
  @ApiResponse({ status: 200, description: 'Daftar kelas berhasil diambil' })
  findAll() {
    return this.coursesService.findAll();
  }

  // PATCH /courses/:id — Edit kelas (khusus pemilik)
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TEACHER')
  @ApiOperation({ summary: 'Edit kelas (khusus pemilik kelas)' })
  @ApiResponse({ status: 200, description: 'Kelas berhasil diupdate' })
  @ApiResponse({ status: 403, description: 'Bukan pemilik kelas' })
  @ApiResponse({ status: 404, description: 'Kelas tidak ditemukan' })
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @Request() req: any,
  ) {
    return this.coursesService.update(id, updateCourseDto, req.user.userId);
  }

  // DELETE /courses/:id — Hapus kelas (khusus pemilik)
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TEACHER')
  @ApiOperation({ summary: 'Hapus kelas (khusus pemilik kelas)' })
  @ApiResponse({ status: 200, description: 'Kelas berhasil dihapus' })
  @ApiResponse({ status: 403, description: 'Bukan pemilik kelas' })
  @ApiResponse({ status: 404, description: 'Kelas tidak ditemukan' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.coursesService.remove(id, req.user.userId);
  }
}
