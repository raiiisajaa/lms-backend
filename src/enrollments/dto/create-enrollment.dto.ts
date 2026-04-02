import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEnrollmentDto {
  @IsString()
  @IsNotEmpty()
  courseId: string; // Hanya butuh ID Kelas yang mau diikutinya
}
