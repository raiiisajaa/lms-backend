import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Lessons')
@ApiBearerAuth()
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  // POST /lessons — Tambah materi video (khusus TEACHER)
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TEACHER')
  @ApiOperation({
    summary: 'Tambah materi video ke dalam bab (khusus TEACHER)',
  })
  @ApiResponse({ status: 201, description: 'Materi berhasil ditambahkan' })
  @ApiResponse({ status: 403, description: 'Bukan pemilik kelas' })
  @ApiResponse({ status: 404, description: 'Bab tidak ditemukan' })
  create(@Body() createLessonDto: CreateLessonDto, @Request() req: any) {
    return this.lessonsService.create(createLessonDto, req.user.userId);
  }

  // PATCH /lessons/:id — Edit materi (khusus pemilik kelas)
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TEACHER')
  @ApiOperation({ summary: 'Edit materi video (khusus pemilik kelas)' })
  @ApiResponse({ status: 200, description: 'Materi berhasil diupdate' })
  @ApiResponse({ status: 403, description: 'Bukan pemilik kelas' })
  @ApiResponse({ status: 404, description: 'Materi tidak ditemukan' })
  update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @Request() req: any,
  ) {
    return this.lessonsService.update(id, updateLessonDto, req.user.userId);
  }

  // DELETE /lessons/:id — Hapus materi (khusus pemilik kelas)
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TEACHER')
  @ApiOperation({ summary: 'Hapus materi video (khusus pemilik kelas)' })
  @ApiResponse({ status: 200, description: 'Materi berhasil dihapus' })
  @ApiResponse({ status: 403, description: 'Bukan pemilik kelas' })
  @ApiResponse({ status: 404, description: 'Materi tidak ditemukan' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.lessonsService.remove(id, req.user.userId);
  }
}
