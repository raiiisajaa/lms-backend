import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // FITUR: Tandai Selesai / Belum Selesai (Toggle)
  // ==========================================
  async toggleProgress(userId: string, chapterId: string) {
    // 1. Pastikan Bab (Chapter) nya memang ada di database
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new NotFoundException('Bab (Chapter) tidak ditemukan!');
    }

    // 2. Cek apakah siswa sudah pernah menandai progres sebelumnya
    const existingProgress = await this.prisma.progress.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId, // <-- Sudah diubah menjadi chapterId
        },
      },
    });

    // 3. Jika sudah ada, balikkan statusnya (Selesai -> Belum Selesai, dst)
    if (existingProgress) {
      return this.prisma.progress.update({
        where: { id: existingProgress.id },
        data: {
          isCompleted: !existingProgress.isCompleted,
          completedAt: !existingProgress.isCompleted ? new Date() : null,
        },
      });
    }

    // 4. Jika belum pernah ada progres, buat rekam jejak baru (Selesai)
    return this.prisma.progress.create({
      data: {
        userId,
        chapterId, // <-- Sudah diubah menjadi chapterId
        isCompleted: true,
        completedAt: new Date(),
      },
    });
  }

  // ==========================================
  // FITUR: Ambil progres spesifik 1 Bab
  // ==========================================
  async getChapterProgress(userId: string, chapterId: string) {
    return this.prisma.progress.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
    });
  }
}
