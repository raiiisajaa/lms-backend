import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Enrollments')
@ApiBearerAuth()
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  // POST /enrollments — Daftar kelas (khusus STUDENT)
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Daftar ke kelas (khusus STUDENT)' })
  @ApiResponse({ status: 201, description: 'Berhasil mendaftar ke kelas' })
  @ApiResponse({
    status: 400,
    description: 'Sudah terdaftar / kelas belum dibuka',
  })
  @ApiResponse({ status: 403, description: 'Bukan STUDENT' })
  @ApiResponse({ status: 404, description: 'Kelas tidak ditemukan' })
  create(
    @Body() createEnrollmentDto: CreateEnrollmentDto,
    @Request() req: any,
  ) {
    return this.enrollmentsService.create(createEnrollmentDto, req.user.userId);
  }
}
