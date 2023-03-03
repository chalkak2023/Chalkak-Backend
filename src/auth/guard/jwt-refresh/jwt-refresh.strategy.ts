import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(req) => req.cookies.refreshToken]),
      secretOrKey: configService.get('JWT_REFRESH_TOKEN_SECRET') || 'refreshToken',
    });
  }

  async validate(payload: Record<string, any>) {
    return payload;
  }
}
