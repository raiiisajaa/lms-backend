import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import * as fs from 'fs';

// Helper: Otomatis buat folder jika belum ada agar tidak error
const createFolderIfNotExist = (folderPath: string) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

@ApiTags('Upload')
@ApiBearerAuth()
@Controller('upload')
@UseGuards(AuthGuard('jwt')) // Amankan SEMUA rute di dalam controller ini
export class UploadController {
  // ==========================================
  // ENDPOINT 1: UNGGAH GAMBAR
  // ==========================================
  @Post('image')
  @ApiOperation({ summary: 'Unggah file gambar (JPG/PNG/GIF)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const folder = './uploads';
          createFolderIfNotExist(folder);
          cb(null, folder);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `img-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
          return cb(
            new BadRequestException('Hanya file gambar yang diperbolehkan!'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File gambar tidak ditemukan!');
    return {
      message: 'Gambar berhasil diunggah!',
      url: `http://localhost:5000/uploads/${file.filename}`,
    };
  }

  // ==========================================
  // ENDPOINT 2: UNGGAH VIDEO (Maks 100MB)
  // ==========================================
  @Post('video')
  @ApiOperation({ summary: 'Unggah file video (MP4) maks 100MB' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 100 * 1024 * 1024, // KODE MAHAL: Batas Mutlak 100MB
      },
      storage: diskStorage({
        destination: (req, file, cb) => {
          const folder = './uploads/videos'; // Video dipisah ke sub-folder
          createFolderIfNotExist(folder);
          cb(null, folder);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `vid-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('video/')) {
          return cb(
            new BadRequestException('Hanya file video yang diperbolehkan!'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File video tidak ditemukan!');
    return {
      message: 'Video berhasil diunggah!',
      url: `http://localhost:5000/uploads/videos/${file.filename}`,
    };
  }
}
