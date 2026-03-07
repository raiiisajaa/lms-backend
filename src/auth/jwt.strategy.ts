import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // 1. Satpam akan mencari tiket di header "Authorization: Bearer <token>"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 2. Tolak tiket yang sudah kedaluwarsa
      ignoreExpiration: false,
      // 3. Cocokkan stempel tiket dengan brankas rahasia kita di .env
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  // 4. Jika tiket asli, ekstrak data (payload) dari dalam tiket tersebut
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
