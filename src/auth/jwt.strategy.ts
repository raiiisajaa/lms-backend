import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  // Setelah token diverifikasi, data ini akan tersedia di req.user
  async validate(payload: any) {
    return {
      userId: payload.sub, // ID user → req.user.userId
      email: payload.email, // Email  → req.user.email
      role: payload.role, // Role   → req.user.role
    };
  }
}
