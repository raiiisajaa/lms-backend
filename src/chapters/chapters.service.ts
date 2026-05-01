import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';

@Injectable()
export class ChaptersService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // HELPER: Cari bab + validasi kepemilikan (SECURITY)
  // Dipakai bersama oleh update dan delete
  // ==========================================
  private async findAndValidateOwnership(id: string, authorId: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id },
      include: {
        course: { select: { teacherId: true } },
      },
    });

    if (!chapter) {
      throw new NotFoundException(`Bab dengan ID ${id} tidak ditemukan.`);
    }

    if (chapter.course.teacherId !== authorId) {
      throw new ForbiddenException(
        'Akses Ditolak! Anda tidak berhak mengubah bab di kelas ini.',
      );
    }

    return chapter;
  }

  // ==========================================
  // FIND ONE: Ambil detail satu bab
  // ==========================================
  async findOne(id: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id },
    });

    if (!chapter) {
      throw new NotFoundException(`Bab dengan ID ${id} tidak ditemukan.`);
    }

    return chapter;
  }

  // ==========================================
  // CREATE: Membuat bab baru
  // ==========================================
  async create(createChapterDto: CreateChapterDto, authorId: string) {
    // Validasi: pastikan kelas milik teacher yang login
    // Asumsi: CreateChapterDto memiliki properti courseId
    const courseId = (createChapterDto as any).courseId;

    if (!courseId) {
      throw new NotFoundException('ID Kelas (courseId) harus disertakan!');
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { teacherId: true },
    });

    if (!course) {
      throw new NotFoundException('Kelas tidak ditemukan.');
    }

    if (course.teacherId !== authorId) {
      throw new ForbiddenException(
        'Akses Ditolak! Anda tidak berhak menambah bab di kelas ini.',
      );
    }

    // Auto-hitung posisi bab terakhir
    const lastChapter = await this.prisma.chapter.findFirst({
      where: { courseId: courseId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const newPosition = lastChapter ? lastChapter.position + 1 : 1;

    return this.prisma.chapter.create({
      data: {
        title: createChapterDto.title,
        courseId: courseId,
        position: newPosition,
      },
    });
  }

  // ==========================================
  // UPDATE: Mengubah Judul, Deskripsi, Video, & Akses
  // ==========================================
  async update(
    id: string,
    updateChapterDto: UpdateChapterDto,
    authorId: string,
  ) {
    // 1. Pastikan yang mengubah adalah Guru Pemilik Kelas
    await this.findAndValidateOwnership(id, authorId);

    // 2. Simpan semua perubahan dari DTO (termasuk videoUrl) ke database
    return this.prisma.chapter.update({
      where: { id },
      data: updateChapterDto,
    });
  }

  // ==========================================
  // DELETE: Menghapus bab
  // ==========================================
  async remove(id: string, authorId: string) {
    await this.findAndValidateOwnership(id, authorId);

    return this.prisma.chapter.delete({
      where: { id },
    });
  }
}
