import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  MinLength,
  IsNotEmpty,
  IsIn,
} from 'class-validator'; // <-- Import aturan dari class-validator

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Nama tidak boleh kosong!' })
  name: string;

  @ApiProperty()
  @IsEmail({}, { message: 'Format email tidak valid!' }) // <-- Wajib format email (@)
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter!' }) // <-- Wajib min 6 huruf
  password: string;

  @ApiProperty({ required: false, enum: ['STUDENT', 'TEACHER'] })
  @IsString()
  @IsIn(['STUDENT', 'TEACHER'], {
    message: 'Role hanya boleh STUDENT atau TEACHER',
  })
  role?: 'STUDENT' | 'TEACHER';
}
