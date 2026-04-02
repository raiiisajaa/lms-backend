import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ==========================================
  // 1. PENGATURAN KEAMANAN (CORS)
  // Wajib diaktifkan agar frontend (React/Vue/Next.js) tidak diblokir browser
  // ==========================================
  app.enableCors();

  // ==========================================
  // 2. VALIDASI OTOMATIS & KEAMANAN INPUT
  // whitelist: true → membuang payload liar yang tidak ada di DTO
  // ==========================================
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // ==========================================
  // 3. SWAGGER — Dokumentasi API
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
  // 4. JALANKAN SERVER
  // ==========================================
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Server berjalan di http://localhost:${port}`);
  console.log(`📚 Swagger docs di http://localhost:${port}/api-docs`);
}

bootstrap().catch((err) => {
  console.error('❌ Gagal menyalakan server:', err);
});
