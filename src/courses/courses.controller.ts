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
  Query,
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
import { GetCoursesQueryDto } from './dto/get-courses-query.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Courses')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt')) // KUNCI UTAMA: Semua rute di sini wajib login
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // ==========================================
  // 1. POST /courses — Buat kelas baru
  // ==========================================
  @Post()
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN') // ✅ ADMIN sekarang bisa membuat kelas
  @ApiOperation({ summary: 'Buat kelas baru (khusus TEACHER & ADMIN)' })
  @ApiResponse({ status: 201, description: 'Kelas berhasil dibuat' })
  @ApiResponse({
    status: 403,
    description: 'Akses ditolak, bukan TEACHER/ADMIN',
  })
  create(@Body() createCourseDto: CreateCourseDto, @Request() req: any) {
    return this.coursesService.create(createCourseDto, req.user.userId);
  }

  // ==========================================
  // 2. GET /courses — Lihat semua kelas (Paginasi & Pencarian)
  // ==========================================
  @Get()
  @ApiOperation({ summary: 'Lihat daftar kelas (terfilter berdasarkan role)' })
  @ApiResponse({ status: 200, description: 'Daftar kelas berhasil diambil' })
  findAll(@Query() query: GetCoursesQueryDto, @Request() req: any) {
    // Teruskan userId dan role ke service agar bisa memfilter data (Isolasi)
    return this.coursesService.findAll(query, req.user.userId, req.user.role);
  }

  // ==========================================
  // 3. GET /courses/:id — Detail satu kelas
  // ==========================================
  @Get(':id')
  @ApiOperation({ summary: 'Lihat detail satu kelas' })
  @ApiResponse({ status: 200, description: 'Detail kelas berhasil diambil' })
  @ApiResponse({ status: 403, description: 'Akses ditolak' })
  @ApiResponse({ status: 404, description: 'Kelas tidak ditemukan' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.coursesService.findOne(id, req.user.userId, req.user.role);
  }

  // ==========================================
  // 4. GET /courses/:id/chapters — Daftar bab
  // ==========================================
  @Get(':id/chapters')
  @ApiOperation({ summary: 'Ambil daftar bab dari sebuah kelas' })
  @ApiResponse({ status: 200, description: 'Daftar bab berhasil diambil' })
  @ApiResponse({ status: 403, description: 'Akses ditolak' })
  @ApiResponse({ status: 404, description: 'Kelas tidak ditemukan' })
  findChapters(@Param('id') id: string, @Request() req: any) {
    return this.coursesService.findChaptersByCourse(
      id,
      req.user.userId,
      req.user.role,
    );
  }

  // ==========================================
  // 5. PATCH /courses/:id — Edit kelas
  // ==========================================
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN') // ✅ ADMIN sekarang bisa mengedit kelas
  @ApiOperation({ summary: 'Edit kelas (khusus pemilik kelas / ADMIN)' })
  @ApiResponse({ status: 200, description: 'Kelas berhasil diupdate' })
  @ApiResponse({
    status: 403,
    description: 'Bukan pemilik kelas atau bukan ADMIN',
  })
  @ApiResponse({ status: 404, description: 'Kelas tidak ditemukan' })
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @Request() req: any,
  ) {
    return this.coursesService.update(id, updateCourseDto, req.user.userId);
  }

  // ==========================================
  // 6. DELETE /courses/:id — Hapus kelas
  // ==========================================
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN') // ✅ ADMIN sekarang bisa menghapus kelas
  @ApiOperation({ summary: 'Hapus kelas (khusus pemilik kelas / ADMIN)' })
  @ApiResponse({ status: 200, description: 'Kelas berhasil dihapus' })
  @ApiResponse({
    status: 403,
    description: 'Bukan pemilik kelas atau bukan ADMIN',
  })
  @ApiResponse({ status: 404, description: 'Kelas tidak ditemukan' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.coursesService.remove(id, req.user.userId);
  }
}
