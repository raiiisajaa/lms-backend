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

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TEACHER')
  @ApiOperation({ summary: 'Buat bab baru di dalam kelas' })
  create(@Body() createChapterDto: CreateChapterDto, @Request() req: any) {
    return this.chaptersService.create(createChapterDto, req.user.userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TEACHER')
  @ApiOperation({ summary: 'Edit bab (Khusus Pemilik Kelas)' })
  update(
    @Param('id') id: string,
    @Body() updateChapterDto: UpdateChapterDto,
    @Request() req: any,
  ) {
    return this.chaptersService.update(id, updateChapterDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('TEACHER')
  @ApiOperation({ summary: 'Hapus bab (Khusus Pemilik Kelas)' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.chaptersService.remove(id, req.user.userId);
  }
}
