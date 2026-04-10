import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Sesuaikan path ini jika error
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { GetCoursesQueryDto } from './dto/get-courses-query.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  // 1. CREATE KELAS
  async create(createCourseDto: CreateCourseDto, authorId: string) {
    const baseSlug = createCourseDto.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

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

  // 2. READ ALL KELAS (Paginasi)
  async findAll(query: GetCoursesQueryDto) {
    const { search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const whereCondition = search
      ? { title: { contains: search, mode: 'insensitive' as const } }
      : {};

    const [total, data] = await this.prisma.$transaction([
      this.prisma.course.count({ where: whereCondition }),
      this.prisma.course.findMany({
        where: whereCondition,
        skip: skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

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

  // 3. READ ONE KELAS
  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: id },
    });

    if (!course) throw new NotFoundException('Kelas tidak ditemukan!');
    return course;
  }

  // ==========================================
  // [KODE MAHAL BARU] MENGAMBIL DAFTAR BAB
  // ==========================================
  async findChaptersByCourse(courseId: string) {
    // Pastikan kelasnya ada dulu
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) throw new NotFoundException('Kelas tidak valid!');

    // Ambil bab dan urutkan berdasarkan posisinya (Bab 1, Bab 2, dst)
    return this.prisma.chapter.findMany({
      where: { courseId: courseId },
      orderBy: { position: 'asc' },
    });
  }

  // 4. UPDATE KELAS
  async update(id: string, updateCourseDto: UpdateCourseDto, authorId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: id } });
    if (!course) throw new NotFoundException('Kelas tidak ditemukan!');
    if (course.teacherId !== authorId) {
      throw new ForbiddenException('Akses Ditolak! Ini bukan kelas Anda.');
    }

    return this.prisma.course.update({
      where: { id: id },
      data: updateCourseDto,
    });
  }

  // 5. DELETE KELAS
  async remove(id: string, authorId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: id } });
    if (!course) throw new NotFoundException('Kelas tidak ditemukan!');
    if (course.teacherId !== authorId) {
      throw new ForbiddenException('Akses Ditolak! Ini bukan kelas Anda.');
    }

    return this.prisma.course.delete({ where: { id: id } });
  }
}
