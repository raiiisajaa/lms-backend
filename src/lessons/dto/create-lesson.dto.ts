import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  videoUrl?: string; // Opsional: Link video materi

  @IsString()
  @IsOptional()
  content?: string; // Opsional: Teks penjelasan materi

  @IsString()
  @IsNotEmpty()
  chapterId: string; // WAJIB: Materi ini untuk bab yang mana?
}
