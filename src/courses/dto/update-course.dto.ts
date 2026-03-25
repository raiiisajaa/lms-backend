import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class UpdateCourseDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean; // Fitur baru: untuk merilis/menyembunyikan kelas
}
