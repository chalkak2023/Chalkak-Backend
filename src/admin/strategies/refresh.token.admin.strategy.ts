import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import _ from 'lodash';
import { AdminService } from 'src/admin/admin.service';

@Injectable()
export class RefreshTokenAdminStrategy extends PassportStrategy(Strategy, 'jwt-refresh-admin') {
  constructor(private adminService: AdminService, private configService: ConfigService) {
    super({
      ignoreExpiration: true,
      passReqToCallback: true,
      secretOrKey: configService.get('JWT_ADMIN_ACCESS_TOKEN_SECRET'),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          const reqCookies = req.cookies['auth-cookie'];
          if (_.isNil(reqCookies)) {
            throw new BadRequestException();
          }
          const parsedData = JSON.parse(reqCookies);
          return parsedData.accessToken;
        },
      ]),
    });
  }
  async validate(req: Record<string, any>, payload: Record<'account', string>) {
    if (!payload) {
      throw new BadRequestException({
        message: 'Access 토큰이 유효하지 않습니다.',
      });
    }
    const authCookieData = JSON.parse(req.cookies['auth-cookie']);
    if (!authCookieData?.refreshToken) {
      throw new BadRequestException({
        message: 'Refresh 토큰이 유효하지 않습니다.',
      });
    }
    const admin = await this.adminService.verifyRefreshToken(payload.account, authCookieData.refreshToken);
    if (!admin) {
      throw new BadRequestException({
        message: '토큰이 만료되었습니다.',
      });
    }
    return admin;
  }
}
