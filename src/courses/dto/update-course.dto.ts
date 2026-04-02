import { PartialType } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto';

// ==========================================
// UPDATE COURSE DTO
// Mewarisi semua properti dari CreateCourseDto (termasuk imageUrl),
// dan secara otomatis menjadikan semuanya opsional (boleh tidak diisi).
// ==========================================
export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
