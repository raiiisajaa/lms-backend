import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProgressDto } from './dto/create-progress.dto';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async toggleProgress(
    studentId: string,
    createProgressDto: CreateProgressDto,
  ) {
    const { lessonId, isCompleted } = createProgressDto;

    // 1. CEK VIDEO & CARI TAHU INI MILIK KELAS APA
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        chapter: true, // Ambil data bab untuk mengintip courseId
      },
    });

    if (!lesson) {
      throw new NotFoundException('Materi video tidak ditemukan!');
    }

    const courseId = lesson.chapter.courseId;

    // 2. CEK PENYUSUP (Apakah siswa ini beneran terdaftar di kelas tersebut?)
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: studentId,
          courseId: courseId,
        },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException(
        'Akses Ditolak! Anda belum mendaftar di kelas ini.',
      );
    }

    // 3. EKSEKUSI TOGGLE DENGAN 'UPSERT'
    return this.prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId: studentId,
          lessonId: lessonId,
        },
      },
      update: {
        isCompleted: isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      create: {
        userId: studentId,
        lessonId: lessonId,
        isCompleted: isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });
  }
}
