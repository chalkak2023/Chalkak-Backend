import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import _ from 'lodash';

@Injectable()
export class JwtAdminStrategy extends PassportStrategy(Strategy, 'jwt-admin') {
  constructor(private configService: ConfigService) {
    super({
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ADMIN_ACCESS_TOKEN_SECRET'),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          const reqCookies = req.cookies['auth-cookie'];
          if (_.isNil(reqCookies)) {
            throw new NotFoundException();
          }
          const parsedData = JSON.parse(reqCookies);
          return parsedData.accessToken;
        },
      ]),
    });
  }
  async validate(payload: Record<string, any>) {
    if (_.isNil(payload)) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
