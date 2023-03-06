import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { response } from 'express';
import { lastValueFrom } from 'rxjs';
import { SocialLoginBodyDTO } from 'src/auth/dto/auth.dto';

@Injectable()
export class SocialNaverService {
  private clientId = this.configService.get('OAUTH2_NAVER_CLIENT_ID');
  private clientSecert = this.configService.get('OAUTH2_NAVER_CLIENT_SECRET');
  private redirectUri = this.configService.get('OAUTH2_NAVER_REDIRECT_URI');

  constructor(private configService: ConfigService, private httpService: HttpService) {}

  async getOauth2Token({code, state}: SocialLoginBodyDTO) {
    const response = await lastValueFrom(
      this.httpService.get('https://nid.naver.com/oauth2.0/token', {
        params: {
          grant_type: 'authorization_code',
          client_id: this.clientId,
          client_secret: this.clientSecert,
          code,
          state,
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
      this.httpService.get('https://openapi.naver.com/v1/nid/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    ).catch((err: AxiosError) => {
      throw new BadRequestException({
        message: '올바르지 않은 접근입니다.',
      });
    });

    return response.data.response
  }
}
