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

  // POST /chapters — Buat bab baru (khusus TEACHER)
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TEACHER')
  create(@Body() createChapterDto: CreateChapterDto, @Request() req: any) {
    return this.chaptersService.create(createChapterDto, req.user.userId);
  }

  // PATCH /chapters/:id — Edit bab (khusus pemilik kelas)
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TEACHER')
  update(
    @Param('id') id: string,
    @Body() updateChapterDto: UpdateChapterDto,
    @Request() req: any,
  ) {
    return this.chaptersService.update(id, updateChapterDto, req.user.userId);
  }

  // DELETE /chapters/:id — Hapus bab (khusus pemilik kelas)
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TEACHER')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.chaptersService.remove(id, req.user.userId);
  }
}
