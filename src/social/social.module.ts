import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { SocialNaverService } from './service/social.naver.service';
import { SocialKakaoService } from "./service/social.kakao.service";
import { SocialService } from "./service/social.service";

@Module({
  imports: [HttpModule],
  providers: [SocialNaverService, SocialKakaoService, SocialService],
  exports: [SocialService]
})
export class SocialModule {}