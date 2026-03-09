import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  // 1. Menyuntikkan mesin Prisma (pekerja gudang) ke dalam ruangan ini
  constructor(private prisma: PrismaService) {}

  // 2. Logika Utama Registrasi
  async create(createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;

    // A. Satpam Pengecek Duplikat
    // Kita suruh Prisma mencari apakah email ini sudah ada di database
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException(
        'Email ini sudah terdaftar. Silakan gunakan email lain.',
      );
    }

    // B. Mesin Pengacak Password (Hashing)
    // Angka 10 adalah "Salt Rounds" (Tingkat kerumitan acakan). Semakin tinggi semakin aman, tapi lebih lambat. 10 adalah standar wajar.
    const hashedPassword = await bcrypt.hash(password, 10);

    // C. Menyimpan ke PostgreSQL
    const newUser = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: createUserDto.role,
      },
    });

    // D. Menyembunyikan Jejak
    // Kita HAPUS password dari hasil kembalian agar tidak bocor ke layar pengguna saat registrasi sukses.
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  // --- Biarkan fungsi di bawah ini tetap ada sebagai kerangka untuk nanti ---
  findAll() {
    return `This action returns all users`;
  }

  findOne(id: string) {
    return `This action returns a #${id} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
