import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // DAFTAR KELAS BARU
  // ==========================================
  async create(createEnrollmentDto: CreateEnrollmentDto, studentId: string) {
    const { courseId } = createEnrollmentDto;

    // VALIDASI 1: Apakah kelasnya beneran ada?
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Kelas tidak ditemukan!');
    }

    // VALIDASI 2: Apakah kelasnya sudah dirilis (Publish)?
    if (!course.isPublished) {
      throw new BadRequestException(
        'Kelas ini belum dibuka untuk pendaftaran.',
      );
    }

    // VALIDASI 3: Apakah ID Siswa ini sudah pernah daftar di kelas ini? (Insting Anda!)
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: studentId,
          courseId: courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException('Anda sudah terdaftar di kelas ini!');
    }

    // JIKA SEMUA VALIDASI LOLOS: Catat pendaftarannya!
    return this.prisma.enrollment.create({
      data: {
        userId: studentId,
        courseId: courseId,
      },
    });
  }
}
