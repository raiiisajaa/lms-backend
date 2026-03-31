import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // 1. CREATE: Membuat Materi Baru
  // ==========================================
  async create(createLessonDto: CreateLessonDto, authorId: string) {
    // CHAIN OF TRUST: Cari Bab-nya, dan tarik sekalian data Kelasnya
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: createLessonDto.chapterId },
      include: { course: true }, // <-- Trik menembus 1 lapis relasi
    });

    if (!chapter) {
      throw new NotFoundException('Bab tidak ditemukan!');
    }

    if (chapter.course.teacherId !== authorId) {
      throw new ForbiddenException(
        'Akses Ditolak! Anda tidak berhak menambah materi di kelas ini.',
      );
    }

    // LOGIKA CERDAS: Hitung otomatis urutan materi di dalam bab ini
    const lastLesson = await this.prisma.lesson.findFirst({
      where: { chapterId: createLessonDto.chapterId },
      orderBy: { position: 'desc' },
    });

    const newPosition = lastLesson ? lastLesson.position + 1 : 1;

    return this.prisma.lesson.create({
      data: {
        title: createLessonDto.title,
        videoUrl: createLessonDto.videoUrl,
        content: createLessonDto.content,
        chapterId: createLessonDto.chapterId,
        position: newPosition,
      },
    });
  }

  // ==========================================
  // 2. UPDATE: Mengubah Materi (Video/Teks)
  // ==========================================
  async update(id: string, updateLessonDto: UpdateLessonDto, authorId: string) {
    // CHAIN OF TRUST LEVEL DEWA: Tarik Materi -> Tarik Bab -> Tarik Kelas
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        chapter: {
          include: {
            course: true, // <-- Trik menembus 2 lapis relasi!
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Materi tidak ditemukan!');
    }

    if (lesson.chapter.course.teacherId !== authorId) {
      throw new ForbiddenException(
        'Akses Ditolak! Anda tidak berhak mengubah materi ini.',
      );
    }

    return this.prisma.lesson.update({
      where: { id },
      data: updateLessonDto,
    });
  }

  // ==========================================
  // 3. DELETE: Menghapus Materi
  // ==========================================
  async remove(id: string, authorId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        chapter: {
          include: { course: true },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Materi tidak ditemukan!');
    }

    if (lesson.chapter.course.teacherId !== authorId) {
      throw new ForbiddenException(
        'Akses Ditolak! Anda tidak berhak menghapus materi ini.',
      );
    }

    return this.prisma.lesson.delete({
      where: { id },
    });
  }
}
