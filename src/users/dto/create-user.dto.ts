import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Role } from '@prisma/client'; // Import mesin Role dari Prisma

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  // Tambahkan baris di bawah ini untuk mengizinkan input role (tapi opsional)
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
