import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateProgressDto {
  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @IsBoolean()
  @IsNotEmpty()
  isCompleted: boolean; // true = centang selesai, false = batal selesai
}
