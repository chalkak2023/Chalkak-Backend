import { BadRequestException, Injectable } from '@nestjs/common';
import _ from 'lodash';
import { SocialLoginBodyDTO } from 'src/auth/dto/auth.dto';
import { ISocialProvider } from '../social.interface';
import { SocialKakaoService } from './social.kakao.service';
import { SocialNaverService } from './social.naver.service';

@Injectable()
export class SocialService {
  services: Record<ISocialProvider, SocialKakaoService | SocialNaverService>;

  constructor(private socialKakaoService: SocialKakaoService, private socialNaverService: SocialNaverService) {
    this.services = {
      kakao: socialKakaoService,
      naver: socialNaverService,
    };
  }

  async validateSocialUser(provider: ISocialProvider, dto: SocialLoginBodyDTO) {
    let service : SocialKakaoService | SocialNaverService;
    switch(provider) {
      case 'kakao':
        service = this.socialKakaoService;
        break;
      case 'naver':
        service = this.socialNaverService;
        break;
    }
    if (_.isNil(service)) {
      throw new BadRequestException({
        message: '지원하지 않는 소셜 로그인 제공자입니다.'
      })
    }

    const oauth2Token = await service.getOauth2Token(dto);
    const userInfo = await service.getUserInfo(oauth2Token.access_token);

    return {
      accessToken: oauth2Token.access_token,
      refreshToken: oauth2Token.refresh_token,
      providerUserId: userInfo.id,
      username: userInfo.username,
    };
  }
}
