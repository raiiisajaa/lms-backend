import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // 1. CREATE: Membuat Kelas Baru
  // ==========================================
  async create(createCourseDto: CreateCourseDto, authorId: string) {
    const baseSlug = createCourseDto.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    // Tambahkan angka acak agar unik (mencegah bentrok judul)
    const uniqueSlug = `${baseSlug}-${Math.floor(Math.random() * 1000)}`;

    return this.prisma.course.create({
      data: {
        title: createCourseDto.title,
        slug: uniqueSlug,
        description: createCourseDto.description,
        price: createCourseDto.price,
        isPublished: createCourseDto.isPublished,
        teacherId: authorId,
      },
    });
  }

  // ==========================================
  // 2. READ ALL: Etalase Semua Kelas
  // ==========================================
  async findAll() {
    return this.prisma.course.findMany({
      orderBy: {
        createdAt: 'desc', // Urutkan dari kelas yang paling baru dibuat
      },
    });
  }

  // ==========================================
  // 3. READ ONE: Detail Satu Kelas Spesifik
  // ==========================================
  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: id },
    });

    if (!course) {
      throw new NotFoundException('Kelas tidak ditemukan!');
    }

    return course;
  }

  // ==========================================
  // 4. UPDATE: Mengubah Kelas (Wajib Pemilik)
  // ==========================================
  async update(id: string, updateCourseDto: UpdateCourseDto, authorId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: id },
    });

    if (!course) {
      throw new NotFoundException('Kelas tidak ditemukan!');
    }

    // CEK KEPEMILIKAN: Tendang jika bukan miliknya!
    if (course.teacherId !== authorId) {
      throw new ForbiddenException(
        'Akses Ditolak! Anda tidak berhak mengubah kelas milik guru lain.',
      );
    }

    return this.prisma.course.update({
      where: { id: id },
      data: updateCourseDto,
    });
  }

  // ==========================================
  // 5. DELETE: Menghapus Kelas (Wajib Pemilik)
  // ==========================================
  async remove(id: string, authorId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: id },
    });

    if (!course) {
      throw new NotFoundException('Kelas tidak ditemukan!');
    }

    // CEK KEPEMILIKAN: Tendang jika bukan miliknya!
    if (course.teacherId !== authorId) {
      throw new ForbiddenException(
        'Akses Ditolak! Anda tidak berhak menghapus kelas ini.',
      );
    }

    return this.prisma.course.delete({
      where: { id: id },
    });
  }
}
