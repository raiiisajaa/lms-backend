import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
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
    // VALIDASI 1: Cek Otorisasi
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

    // KALKULASI 1: Hitung total chapter yang sudah dipublish di kelas ini
    // PERUBAHAN: this.prisma.lesson.count → this.prisma.chapter.count
    // Chapter sekarang langsung punya courseId, tidak ada nested lesson-chapter lagi
    const totalChapters = await this.prisma.chapter.count({
      where: {
        courseId: courseId,
        isPublished: true, // Hanya hitung yang sudah dipublish
      },
    });

    // Cegah error "pembagian dengan nol" jika belum ada chapter
    if (totalChapters === 0) {
      return {
        totalChapters: 0,
        completedChapters: 0,
        percentage: 0,
        isFullyCompleted: false,
      };
    }

    // KALKULASI 2: Hitung chapter yang sudah diselesaikan oleh siswa ini
    // PERUBAHAN: filter 'lesson' → 'chapter' (sesuai relasi di schema baru)
    const completedChapters = await this.prisma.progress.count({
      where: {
        userId: studentId,
        isCompleted: true,
        chapter: {
          courseId: courseId, // Pastikan chapter-nya dari kelas yang sedang dicek
        },
      },
    });

    // MATEMATIKA FINAL: Jadikan persentase (Dibulatkan)
    const percentage = Math.round((completedChapters / totalChapters) * 100);

    return {
      courseId,
      totalChapters,
      completedChapters,
      percentage,
      isFullyCompleted: percentage === 100,
    };
  }
}
