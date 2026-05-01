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
  // 1. CREATE: Buat kelas baru
  // ==========================================
  async create(createCourseDto: CreateCourseDto, teacherId: string) {
    const baseSlug = createCourseDto.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const uniqueSlug = `${baseSlug}-${Date.now()}`;

    return this.prisma.course.create({
      data: {
        title: createCourseDto.title,
        slug: uniqueSlug,
        description: createCourseDto.description,
        price: createCourseDto.price ?? 0,
        isPublished: createCourseDto.isPublished ?? false,
        teacherId: teacherId,
      },
    });
  }

  // ==========================================
  // 2. READ ALL: Dengan isolasi berdasarkan role
  // ==========================================
  async findAll(query: GetCoursesQueryDto, userId: string, role: string) {
    const { search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    // Bangun filter isolasi berdasarkan role
    const isolationFilter = this.buildIsolationFilter(userId, role);

    // Gabungkan filter isolasi dengan filter pencarian
    const whereCondition = {
      ...isolationFilter,
      ...(search && {
        title: { contains: search, mode: 'insensitive' as const },
      }),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.course.count({ where: whereCondition }),
      this.prisma.course.findMany({
        where: whereCondition,
        skip: skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          teacher: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { chapters: true, enrollments: true },
          },
        },
      }),
    ]);

    return {
      meta: {
        totalData: total,
        currentPage: Number(page),
        dataPerPage: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
      data,
    };
  }

  // ==========================================
  // 3. READ ONE: Detail kelas + validasi akses
  // ==========================================
  async findOne(id: string, userId: string, role: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        teacher: {
          select: { id: true, name: true, email: true },
        },
        chapters: {
          where: { isPublished: true },
          orderBy: { position: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            isFree: true,
            position: true,
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!course) throw new NotFoundException('Kelas tidak ditemukan!');

    if (role === 'TEACHER' && course.teacherId !== userId) {
      throw new ForbiddenException('Akses Ditolak! Ini bukan kelas Anda.');
    }

    if (role === 'STUDENT' && !course.isPublished) {
      throw new ForbiddenException('Kelas ini belum tersedia untuk publik.');
    }

    return course;
  }

  // ==========================================
  // 4. READ CHAPTERS: Ambil bab dari sebuah kelas
  // ==========================================
  async findChaptersByCourse(courseId: string, userId: string, role: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) throw new NotFoundException('Kelas tidak ditemukan!');

    if (role === 'TEACHER' && course.teacherId !== userId) {
      throw new ForbiddenException('Akses Ditolak! Ini bukan kelas Anda.');
    }

    const isOwnerOrAdmin =
      role === 'ADMIN' || (role === 'TEACHER' && course.teacherId === userId);

    return this.prisma.chapter.findMany({
      where: {
        courseId: courseId,
        ...(!isOwnerOrAdmin && { isPublished: true }),
      },
      orderBy: { position: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        videoUrl: isOwnerOrAdmin,
        position: true,
        isPublished: true,
        isFree: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // ==========================================
  // 5. UPDATE: Edit kelas (hanya pemilik)
  // ==========================================
  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
    teacherId: string,
  ) {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course) throw new NotFoundException('Kelas tidak ditemukan!');
    if (course.teacherId !== teacherId) {
      throw new ForbiddenException('Akses Ditolak! Ini bukan kelas Anda.');
    }

    return this.prisma.course.update({
      where: { id },
      data: updateCourseDto,
    });
  }

  // ==========================================
  // 6. DELETE: Hapus kelas (hanya pemilik)
  // ==========================================
  async remove(id: string, teacherId: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course) throw new NotFoundException('Kelas tidak ditemukan!');
    if (course.teacherId !== teacherId) {
      throw new ForbiddenException('Akses Ditolak! Ini bukan kelas Anda.');
    }

    return this.prisma.course.delete({ where: { id } });
  }

  // ==========================================
  // PRIVATE HELPER: Bangun filter isolasi data
  // ==========================================
  private buildIsolationFilter(userId: string, role: string) {
    switch (role) {
      case 'TEACHER':
        return { teacherId: userId };
      case 'STUDENT':
        return { isPublished: true };
      case 'ADMIN':
        return {};
      default:
        return { isPublished: true };
    }
  }
}
