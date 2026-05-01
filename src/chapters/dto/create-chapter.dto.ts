import { IsString, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateChapterDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  // ==== INI TERSANGKA UTAMANYA (WAJIB ADA) ====
  @IsString()
  @IsNotEmpty()
  courseId: string;

  // ==== KODE MAHAL: Persiapan untuk fitur Upload Video ====
  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsBoolean()
  @IsOptional()
  isFree?: boolean;
}
