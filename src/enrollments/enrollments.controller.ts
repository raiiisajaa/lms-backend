import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam, // <-- Tambahan untuk dokumentasi parameter URL di Swagger
} from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Enrollments')
@ApiBearerAuth() // Memunculkan gembok JWT khusus untuk modul ini di Swagger
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  // ==========================================
  // 1. POST: Mendaftar ke Kelas Baru
  // Endpoint: /enrollments
  // ==========================================
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('STUDENT') // Pertahanan berlapis: Hanya siswa!
  @ApiOperation({ summary: 'Daftar ke kelas (khusus STUDENT)' })
  @ApiResponse({
    status: 201,
    description: 'Siswa berhasil mendaftar ke kelas.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Gagal: Siswa sudah terdaftar atau kelas belum berstatus Publish.',
  })
  @ApiResponse({
    status: 403,
    description: 'Akses Ditolak: Role bukan STUDENT.',
  })
  @ApiResponse({
    status: 404,
    description: 'Gagal: ID Kelas tidak ditemukan di sistem.',
  })
  create(
    @Body() createEnrollmentDto: CreateEnrollmentDto,
    @Request() req: any,
  ) {
    // req.user.userId didapatkan dari token JWT yang diekstrak oleh AuthGuard
    return this.enrollmentsService.create(createEnrollmentDto, req.user.userId);
  }

  // ==========================================
  // 2. GET: Cek Kalkulasi Progres Siswa
  // Endpoint: /enrollments/:courseId/progress
  // ==========================================
  @Get(':courseId/progress')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('STUDENT') // Pertahanan berlapis: Hanya siswa yang bisa mengecek rapornya!
  @ApiOperation({
    summary: 'Kalkulasi persentase kelulusan kelas (khusus STUDENT)',
  })
  @ApiParam({
    name: 'courseId',
    description: 'ID dari Kelas yang ingin dicek progresnya',
    example: 'cf1eecb9-0ead-41a8-9bce-26738df286fd',
  })
  @ApiResponse({
    status: 200,
    description:
      'Kalkulasi berhasil (Mengembalikan total video, video selesai, dan persentase).',
  })
  @ApiResponse({
    status: 403,
    description: 'Akses Ditolak: Anda belum mendaftar di kelas ini.',
  })
  getProgress(@Param('courseId') courseId: string, @Request() req: any) {
    const studentId = req.user.userId;
    return this.enrollmentsService.getCourseProgress(studentId, courseId);
  }
}
