import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Progress')
@ApiBearerAuth()
@Controller('progress')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('STUDENT', 'TEACHER') // Murid bisa menyelesaikan bab, Guru bisa tes
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post(':chapterId/toggle')
  @ApiOperation({ summary: 'Tandai bab selesai atau belum selesai' })
  toggleProgress(@Param('chapterId') chapterId: string, @Request() req: any) {
    return this.progressService.toggleProgress(req.user.userId, chapterId);
  }

  @Get(':chapterId')
  @ApiOperation({ summary: 'Cek status progres 1 bab' })
  getChapterProgress(
    @Param('chapterId') chapterId: string,
    @Request() req: any,
  ) {
    return this.progressService.getChapterProgress(req.user.userId, chapterId);
  }
}
