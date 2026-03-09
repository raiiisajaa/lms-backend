import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Cek apakah rute ini punya stempel @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 2. Jika tidak ada stempel role, berarti rute ini bebas untuk semua (yang punya JWT)
    if (!requiredRoles) {
      return true;
    }

    // 3. Ambil data user dari tiket JWT yang sudah dibongkar oleh satpam lapis pertama
    const { user } = context.switchToHttp().getRequest();

    // 4. Cocokkan: Apakah role user ada di dalam daftar stempel?
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        'Akses Ditolak: Fitur ini khusus untuk peran tertentu!',
      );
    }

    return true; // Boleh masuk!
  }
}
