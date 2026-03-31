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

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TEACHER')
  @Post()
  create(@Body() createLessonDto: CreateLessonDto, @Request() req: any) {
    const authorId = req.user.userId; // <-- SUDAH DIPERBAIKI KE userId
    return this.lessonsService.create(createLessonDto, authorId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TEACHER')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @Request() req: any,
  ) {
    const authorId = req.user.userId; // <-- SUDAH DIPERBAIKI KE userId
    return this.lessonsService.update(id, updateLessonDto, authorId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TEACHER')
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    const authorId = req.user.userId; // <-- SUDAH DIPERBAIKI KE userId
    return this.lessonsService.remove(id, authorId);
  }
}
