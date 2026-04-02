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
import { ChaptersService } from './chapters.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Chapters')
@ApiBearerAuth()
@Controller('chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  // POST /chapters — Buat bab baru (khusus TEACHER)
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TEACHER')
  @ApiOperation({ summary: 'Buat bab baru di dalam kelas (khusus TEACHER)' })
  @ApiResponse({ status: 201, description: 'Bab berhasil dibuat' })
  @ApiResponse({ status: 403, description: 'Bukan pemilik kelas' })
  @ApiResponse({ status: 404, description: 'Kelas tidak ditemukan' })
  create(@Body() createChapterDto: CreateChapterDto, @Request() req: any) {
    return this.chaptersService.create(createChapterDto, req.user.userId);
  }

  // PATCH /chapters/:id — Edit bab (khusus pemilik kelas)
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TEACHER')
  @ApiOperation({ summary: 'Edit bab (khusus pemilik kelas)' })
  @ApiResponse({ status: 200, description: 'Bab berhasil diupdate' })
  @ApiResponse({ status: 403, description: 'Bukan pemilik kelas' })
  @ApiResponse({ status: 404, description: 'Bab tidak ditemukan' })
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
  @ApiOperation({ summary: 'Hapus bab (khusus pemilik kelas)' })
  @ApiResponse({ status: 200, description: 'Bab berhasil dihapus' })
  @ApiResponse({ status: 403, description: 'Bukan pemilik kelas' })
  @ApiResponse({ status: 404, description: 'Bab tidak ditemukan' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.chaptersService.remove(id, req.user.userId);
  }
}
