import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class SocialKakaoService {
  private clientId = this.configService.get('OAUTH2_KAKAO_CLIENT_ID');
  private clientSecert = this.configService.get('OAUTH2_KAKAO_CLIENT_SECRET');
  private redirectUri = this.configService.get(
    'OAUTH2_KAKAO_REDIRECT_URI',
  );

  constructor(private configService: ConfigService, private httpService: HttpService) {}

  async getOauth2Token(code: string) {
    const response = await lastValueFrom(
      this.httpService.get('https://kauth.kakao.com/oauth/token', {
        params: {
          grant_type: 'authorization_code',
          client_id: this.clientId,
          client_secret: this.clientSecert,
          redirect_uri: this.redirectUri,
          code,
        },
      })
    ).catch((err: AxiosError) => {
      throw new BadRequestException({
        message: '로그인 요청이 잘못되었습니다.',
      });
    });

    return response.data;
  }

  async getUserInfo(accessToken: string) {
    const response = await lastValueFrom(
      this.httpService.get('https://kapi.kakao.com/v2/user/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    ).catch((err: AxiosError) => {
      throw new BadRequestException({
        message: '올바르지 않은 접근입니다.',
      });
    });

    return response.data
  }
}