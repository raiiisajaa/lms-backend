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
import { ChaptersService } from './chapters.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TEACHER')
  @Post()
  create(@Body() createChapterDto: CreateChapterDto, @Request() req: any) {
    const authorId = req.user.userId; // <-- KEMBALIKAN KE userId
    return this.chaptersService.create(createChapterDto, authorId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TEACHER')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateChapterDto: UpdateChapterDto,
    @Request() req: any,
  ) {
    const authorId = req.user.userId; // <-- KEMBALIKAN KE userId
    return this.chaptersService.update(id, updateChapterDto, authorId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TEACHER')
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    const authorId = req.user.userId; // <-- KEMBALIKAN KE userId
    return this.chaptersService.remove(id, authorId);
  }
}
