import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  // 1. Suntikkan Prisma (Pekerja Gudang) dan JwtService (Mesin Pencetak Tiket)
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // 2. Fungsi Utama Login
  async login(email: string, pass: string) {
    // A. Cari user berdasarkan email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Jika user tidak ada, langsung tolak (Error 401)
    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // B. Cek kecocokan password
    // Mesin bcrypt akan membandingkan teks asli dengan teks acak di database
    const isPasswordValid = await bcrypt.compare(pass, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // C. Jika lolos ujian, siapkan data untuk dimasukkan ke dalam Tiket JWT (Payload)
    // Standar keamanan: JANGAN PERNAH memasukkan password ke dalam token!
    const payload = {
      sub: user.id, // 'sub' adalah standar industri untuk Subject (ID User)
      email: user.email,
      role: user.role,
    };

    // D. Cetak dan berikan tiketnya
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
