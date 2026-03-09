//SENIN MALAM 09/03/2025
//by raihan saja

import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
// Fungsi ini akan mengubah teks seperti @Roles('TEACHER') menjadi metadata yang bisa dibaca sistem
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
