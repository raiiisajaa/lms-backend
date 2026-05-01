import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { json, urlencoded } from 'express'; // <-- KODE MAHAL: Penjaga gerbang paket besar

async function bootstrap() {
  const logger = new Logger('EduTech-Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ==========================================
  // 1. PERLEBAR GERBANG UNTUK VIDEO (100MB)
  // ==========================================
  app.use(json({ limit: '100mb' }));
  app.use(urlencoded({ limit: '100mb', extended: true }));

  // ==========================================
  // 2. CORS
  // ==========================================
  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // ==========================================
  // 3. VALIDATION PIPE GLOBAL
  // ==========================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ==========================================
  // 4. STATIC ASSETS (Upload Files)
  // ==========================================
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  // ==========================================
  // 5. SWAGGER
  // ==========================================
  const config = new DocumentBuilder()
    .setTitle('EduTech LMS Enterprise API')
    .setDescription('Arsitektur Inti Learning Management System tingkat lanjut')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // ==========================================
  // 6. LAUNCH
  // ==========================================
  const port = process.env.PORT || 5000;
  await app.listen(port);

  logger.log(`=================================================`);
  logger.log(`🚀 NESTJS BERHASIL MENGUDARA!`);
  logger.log(`📡 API    : http://localhost:${port}`);
  logger.log(`📖 Swagger: http://localhost:${port}/api-docs`);
  logger.log(`=================================================`);
}

bootstrap().catch((err) => {
  const logger = new Logger('SystemCrash');
  logger.error('❌ MESIN GAGAL MENYALA:', err);
});
