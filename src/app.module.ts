import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // ← tambahkan ini PALING ATAS
    PrismaModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
