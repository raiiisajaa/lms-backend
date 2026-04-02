import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { GetCoursesQueryDto } from './dto/get-courses-query.dto';

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
  // 2. READ ALL: Etalase dengan Paginasi & Search
  // ==========================================
  async findAll(query: GetCoursesQueryDto) {
    const { search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit; // Rumus lompatan data (Offset)

    // BANGUN FILTER PENCARIAN (Berdasarkan Judul)
    const whereCondition = search
      ? {
          title: {
            contains: search,
            mode: 'insensitive' as const, // Case-insensitive (huruf besar/kecil tidak ngaruh)
          },
        }
      : {};

    // EKSEKUSI PARALEL: Hitung total semua data vs Ambil data terpotong
    const [total, data] = await this.prisma.$transaction([
      this.prisma.course.count({ where: whereCondition }), // Hitung jumlah baris
      this.prisma.course.findMany({
        where: whereCondition,
        skip: skip,
        take: limit, // Batasi jumlah yang diambil
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // KEMBALIKAN DENGAN FORMAT META (Standard Industri)
    return {
      meta: {
        totalData: total,
        currentPage: page,
        dataPerPage: limit,
        totalPages: Math.ceil(total / limit),
      },
      data,
    };
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
