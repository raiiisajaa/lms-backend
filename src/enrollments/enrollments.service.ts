import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException, // <-- Tambahan baru: Untuk menendang penyusup!
} from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // 1. CREATE: Mendaftarkan Siswa ke Kelas
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

    // VALIDASI 3: Cegah Pendaftaran Ganda
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

  // ==========================================
  // 2. GET PROGRESS: Menghitung Persentase Kelulusan
  // ==========================================
  async getCourseProgress(studentId: string, courseId: string) {
    // VALIDASI 1: Cek Otorisasi - Apakah siswa ini beneran murid di kelas ini?
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId: studentId, courseId: courseId },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException(
        'Akses ditolak! Anda belum terdaftar di kelas ini.',
      );
    }

    // KALKULASI 1: Hitung total semua video di kelas ini
    // Logika relasi: Kita mencari Lesson (Video) yang menempel pada Chapter yang menempel pada courseId ini.
    const totalLessons = await this.prisma.lesson.count({
      where: {
        chapter: {
          courseId: courseId,
        },
      },
    });

    // Cegah error "pembagian dengan nol (0)" jika guru belum upload video sama sekali
    if (totalLessons === 0) {
      return {
        totalLessons: 0,
        completedLessons: 0,
        percentage: 0,
        isFullyCompleted: false,
      };
    }

    // KALKULASI 2: Hitung video yang sudah ditonton khusus oleh siswa ini
    const completedLessons = await this.prisma.progress.count({
      where: {
        userId: studentId,
        isCompleted: true, // Hanya hitung yang statusnya selesai
        lesson: {
          chapter: {
            courseId: courseId, // Pastikan videonya dari kelas yang sedang dicek
          },
        },
      },
    });

    // MATEMATIKA FINAL: Jadikan persentase (Dibulatkan)
    const percentage = Math.round((completedLessons / totalLessons) * 100);

    // KEMBALIKAN HASIL: Format JSON ini yang akan ditangkap oleh Frontend
    return {
      courseId,
      totalLessons,
      completedLessons,
      percentage,
      isFullyCompleted: percentage === 100, // Akan bernilai true jika persentase mencapai 100
    };
  }
}
