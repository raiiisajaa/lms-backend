import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Judul kelas (wajib diisi)',
    example: 'Bootcamp Fullstack Developer',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Deskripsi lengkap tentang materi kelas',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Harga kelas dalam Rupiah (kosongkan jika gratis)',
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    description: 'Status rilis kelas (true = bisa dibeli/diakses siswa)',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  // ==========================================
  // FITUR BARU: URL GAMBAR COVER
  // ==========================================
  @ApiPropertyOptional({
    description: 'URL gambar cover kelas (didapat dari endpoint /upload/image)',
    example: 'http://localhost:3000/uploads/file-12345.png',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
