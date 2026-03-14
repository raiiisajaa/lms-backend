import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(createCourseDto: CreateCourseDto, authorId: string) {
    // 1. Sistem Pintar Pembuat Slug Otomatis (Contoh: Belajar Node -> belajar-node)
    const baseSlug = createCourseDto.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Ubah spasi & simbol jadi strip (-)
      .replace(/(^-|-$)+/g, ''); // Hapus strip di awal/akhir

    // Tambahkan angka acak di belakang agar unik (mencegah bentrok judul)
    const uniqueSlug = `${baseSlug}-${Math.floor(Math.random() * 1000)}`;

    // 2. Simpan ke Database
    return this.prisma.course.create({
      data: {
        title: createCourseDto.title,
        slug: uniqueSlug,
        description: createCourseDto.description,
        price: createCourseDto.price,
        teacherId: authorId,
      },
    });
  }

  // 3. Fungsi Etalase: Mengambil semua daftar kelas
  async findAll() {
    return this.prisma.course.findMany({
      orderBy: {
        createdAt: 'desc', // Urutkan dari kelas yang paling baru dibuat
      },
    });
  }
}
