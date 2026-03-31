import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateChapterDto } from './dto/update-chapter.dto';

@Injectable()
export class ChaptersService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // CREATE: Membuat Bab Baru (Dikembalikan ke Logika Cerdas)
  // ==========================================
  async create(createChapterDto: CreateChapterDto, authorId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: createChapterDto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Kelas tidak ditemukan!');
    }

    if (course.teacherId !== authorId) {
      throw new ForbiddenException(
        'Akses Ditolak! Anda tidak berhak menambah bab di kelas ini.',
      );
    }

    // LOGIKA CERDAS: Hitung otomatis posisi bab terakhir
    const lastChapter = await this.prisma.chapter.findFirst({
      where: { courseId: createChapterDto.courseId },
      orderBy: { position: 'desc' },
    });

    const newPosition = lastChapter ? lastChapter.position + 1 : 1;

    // Simpan bab baru dengan posisi otomatis
    return this.prisma.chapter.create({
      data: {
        title: createChapterDto.title,
        courseId: createChapterDto.courseId,
        position: newPosition,
      },
    });
  }

  // ==========================================
  // UPDATE: Mengubah Judul Bab
  // ==========================================
  async update(
    id: string,
    updateChapterDto: UpdateChapterDto,
    authorId: string,
  ) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!chapter) {
      throw new NotFoundException('Bab tidak ditemukan!');
    }

    if (chapter.course.teacherId !== authorId) {
      throw new ForbiddenException(
        'Akses Ditolak! Anda tidak berhak mengubah bab di kelas ini.',
      );
    }

    return this.prisma.chapter.update({
      where: { id },
      data: updateChapterDto,
    });
  }

  // ==========================================
  // DELETE: Menghapus Bab
  // ==========================================
  async remove(id: string, authorId: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!chapter) {
      throw new NotFoundException('Bab tidak ditemukan!');
    }

    if (chapter.course.teacherId !== authorId) {
      throw new ForbiddenException(
        'Akses Ditolak! Anda tidak berhak menghapus bab ini.',
      );
    }

    return this.prisma.chapter.delete({
      where: { id },
    });
  }
}
