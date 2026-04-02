import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express'; // <-- Tambahan untuk akses mesin Express
import { join } from 'path'; // <-- Tambahan untuk mengatur rute folder fisik

async function bootstrap() {
  // Mendaftarkan app sebagai NestExpressApplication secara eksplisit
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ==========================================
  // 1. PENGATURAN KEAMANAN (CORS)
  // Wajib diaktifkan agar frontend (React/Vue/Next.js) tidak diblokir browser
  // ==========================================
  app.enableCors();

  // ==========================================
  // 2. VALIDASI OTOMATIS & KEAMANAN INPUT
  // whitelist: true → membuang payload liar yang tidak ada di DTO
  // transform: true → mengubah string di URL query menjadi tipe data asli (number/boolean)
  // ==========================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // ==========================================
  // 3. AKSES FILE PUBLIK (STATIC ASSETS)
  // Membuka gerbang folder 'uploads' agar file di dalamnya bisa diakses via URL browser
  // ==========================================
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // ==========================================
  // 4. SWAGGER — Dokumentasi API
  // ==========================================
  const config = new DocumentBuilder()
    .setTitle('LMS Backend API')
    .setDescription('Dokumentasi resmi untuk API Learning Management System')
    .setVersion('1.0')
    .addBearerAuth() // Memunculkan tombol Authorize untuk token JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // ==========================================
  // 5. JALANKAN SERVER
  // ==========================================
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Server berjalan di http://localhost:${port}`);
  console.log(`📚 Swagger docs di http://localhost:${port}/api-docs`);
}

bootstrap().catch((err) => {
  console.error('❌ Gagal menyalakan server:', err);
});
