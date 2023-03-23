import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import _ from 'lodash';

@Injectable()
export class AuthJwtService {
  private accessTokenSecret: string;
  private accessTokenExpiresIn: string;
  private refreshTokenSecret: string;
  private refreshTokenExpiresIn: string;

  constructor(private jwtService: JwtService, private configService: ConfigService) {
    this.accessTokenSecret = this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET')!;
    this.accessTokenExpiresIn = this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN')!;
    this.refreshTokenSecret = this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET')!;
    this.refreshTokenExpiresIn = this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN')!;
  }

  generateUserAccessToken(user: User) {
    return this.jwtService.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: 'user',
      },
      {
        secret: this.accessTokenSecret,
        expiresIn: this.accessTokenExpiresIn,
      }
    );
  }

  generateUserRefreshToken() {
    return this.jwtService.sign(
      {
        random: Math.floor(Math.random() * 10000) + 1,
      },
      {
        secret: this.refreshTokenSecret,
        expiresIn: this.refreshTokenExpiresIn,
      }
    );
  }

  async verifyUserAccessTokenWithoutExpiresIn(accessToken: string) {
    try {
      await this.jwtService.verifyAsync(accessToken, {
        secret: this.accessTokenSecret,
      });
    } catch (err) {
      if (err.name === 'JsonWebTokenError') {
        throw new UnauthorizedException({
          message: '정상 발급된 액세스 토큰이 아닙니다.',
        });
      }
    }
  }
}
