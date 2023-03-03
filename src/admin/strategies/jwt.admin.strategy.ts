import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import _ from 'lodash';

@Injectable()
export class JwtAdminStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      ignoreExpiration: false,
      secretOrKey: 'temporary',
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let data = request?.cookies['auth-cookie'];
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
