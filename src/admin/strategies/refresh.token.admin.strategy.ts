import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import _ from 'lodash';
import { AdminService } from 'src/admin/admin.service';

@Injectable()
export class RefreshTokenAdminStrategy extends PassportStrategy(Strategy, 'jwt-refresh-admin') {
  constructor(private adminService: AdminService) {
    super({
      ignoreExpiration: true,
      passReqToCallback: true,
      secretOrKey: 'temporary',
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let data = request?.cookies['auth-cookie'];
          if (_.isNil(data)) {
            throw new BadRequestException();
          }
          return data.accessToken;
        },
      ]),
    });
  }
  async validate(req: Request, payload: any) {
    if (!payload) {
      throw new BadRequestException({
        message: 'Access 토큰이 유효하지 않습니다.',
      });
    }
    let authCookieData = req?.cookies['auth-cookie'];
    if (!authCookieData?.refreshToken) {
      throw new BadRequestException({
        message: 'Refresh 토큰이 유효하지 않습니다.',
      });
    }
    let admin = await this.adminService.verifyRefreshToken(payload.account, authCookieData.refreshToken);
    if (!admin) {
      throw new BadRequestException({
        message: '토큰이 만료되었습니다.',
      });
    }
    return admin;
  }
}
