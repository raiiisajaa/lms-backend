import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  // POST /enrollments — Daftar kelas (khusus STUDENT)
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('STUDENT')
  create(
    @Body() createEnrollmentDto: CreateEnrollmentDto,
    @Request() req: any,
  ) {
    const studentId = req.user.userId; // ambil dari JWT via JwtStrategy
    return this.enrollmentsService.create(createEnrollmentDto, studentId);
  }
}
