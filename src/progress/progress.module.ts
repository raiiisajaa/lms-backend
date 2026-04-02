import { Module } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { PrismaModule } from '../prisma/prisma.module'; // <-- 1. Import ini

@Module({
  imports: [PrismaModule], // <-- 2. Daftarkan di sini
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
