import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateProgressDto {
  @IsString()
  @IsNotEmpty()
  chapterId: string; // ← ganti dari lessonId

  @IsBoolean()
  @IsNotEmpty()
  isCompleted: boolean; // true = centang selesai, false = batal selesai
}
