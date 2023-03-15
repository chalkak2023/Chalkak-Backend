import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import _ from 'lodash';

@Injectable()
export class JwtAdminStrategy extends PassportStrategy(Strategy, 'jwt-admin') {
  constructor(private configService: ConfigService) {
    super({
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ADMIN_ACCESS_TOKEN_SECRET'),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let data = JSON.parse(request?.cookies['auth-cookie']);
          if (!data) {
            return new BadRequestException();
          }
          return data.accessToken;
        },
      ]),
    });
  }
  async validate(payload: any) {
    if (_.isNil(payload)) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
