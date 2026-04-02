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
  Query, // <-- PERBAIKAN 1: Wajib di-import untuk menangkap parameter URL (?search=...)
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
import { GetCoursesQueryDto } from './dto/get-courses-query.dto'; // <-- PERBAIKAN 2: Import formulir paginasinya
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Courses')
@ApiBearerAuth()
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // ==========================================
  // 1. POST: Buat kelas baru (khusus TEACHER)
  // ==========================================
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TEACHER')
  @ApiOperation({ summary: 'Buat kelas baru (khusus TEACHER)' })
  @ApiResponse({ status: 201, description: 'Kelas berhasil dibuat' })
  @ApiResponse({ status: 403, description: 'Bukan TEACHER' })
  create(@Body() createCourseDto: CreateCourseDto, @Request() req: any) {
    return this.coursesService.create(createCourseDto, req.user.userId);
  }

  // ==========================================
  // 2. GET: Lihat semua kelas (Paginasi & Pencarian)
  // ==========================================
  @Get()
  @UseGuards(AuthGuard('jwt')) // Bisa diakses Teacher maupun Student
  @ApiOperation({
    summary: 'Lihat semua kelas dengan fitur Paginasi & Pencarian',
  })
  @ApiResponse({
    status: 200,
    description: 'Daftar kelas berhasil diambil beserta format Meta Data',
  })
  findAll(@Query() query: GetCoursesQueryDto) {
    // <-- PERBAIKAN 3: Menangkap parameter query dan memasukkannya ke Service
    return this.coursesService.findAll(query);
  }

  // ==========================================
  // 3. PATCH: Edit kelas (khusus pemilik)
  // ==========================================
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

  // ==========================================
  // 4. DELETE: Hapus kelas (khusus pemilik)
  // ==========================================
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
