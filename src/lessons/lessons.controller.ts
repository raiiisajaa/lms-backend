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
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  // POST /lessons — Tambah materi video (khusus TEACHER)
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TEACHER')
  create(@Body() createLessonDto: CreateLessonDto, @Request() req: any) {
    return this.lessonsService.create(createLessonDto, req.user.userId);
  }

  // PATCH /lessons/:id — Edit materi (khusus pemilik kelas)
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TEACHER')
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
  remove(@Param('id') id: string, @Request() req: any) {
    return this.lessonsService.remove(id, req.user.userId);
  }
}
