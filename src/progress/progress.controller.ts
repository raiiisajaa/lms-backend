import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('STUDENT') // <-- Hanya Siswa!
  @Post()
  toggle(@Body() createProgressDto: CreateProgressDto, @Request() req: any) {
    const studentId = req.user.userId;
    return this.progressService.toggleProgress(studentId, createProgressDto);
  }
}
