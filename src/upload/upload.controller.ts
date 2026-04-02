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

@ApiTags('Upload')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  // ==========================================
  // POST: Unggah Gambar (Khusus User Login)
  // ==========================================
  @Post('image')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Unggah file gambar (JPG/PNG)' })
  @ApiConsumes('multipart/form-data') // <-- PENTING: Memberitahu Swagger bahwa ini form file, bukan JSON!
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary', // <-- Ini yang memunculkan tombol "Browse/Choose File" di Swagger
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // Target folder penyimpanan
        filename: (req, file, cb) => {
          // Membuat nama file unik: file-123456789.jpg
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Keamanan tambahan: Hanya terima format gambar
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(
            new BadRequestException('Hanya file gambar yang diperbolehkan!'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan!');
    }

    return {
      message: 'File berhasil diunggah!',
      filename: file.filename,
      // URL statis sementara yang nanti bisa disimpan ke tabel Course/User
      url: `http://localhost:3000/uploads/${file.filename}`,
    };
  }
}
