import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { SocialNaverService } from './service/social.naver.service';
import { SocialKakaoService } from "./service/social.kakao.service";

@Module({
  imports: [HttpModule],
  providers: [SocialNaverService, SocialKakaoService],
  exports: [SocialNaverService, SocialKakaoService]
})
export class SocialModule {}