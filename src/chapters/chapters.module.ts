import { Module } from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { ChaptersController } from './chapters.controller';
import { PrismaModule } from '../prisma/prisma.module'; // <-- 1. Import ini

@Module({
  imports: [PrismaModule], // <-- 2. Daftarkan di sini
  controllers: [ChaptersController],
  providers: [ChaptersService],
})
export class ChaptersModule {}
