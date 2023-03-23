import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { SocialNaverService } from './services/social.naver.service';
import { SocialKakaoService } from "./services/social.kakao.service";
import { SocialService } from "./services/social.service";

@Module({
  imports: [HttpModule],
  providers: [SocialNaverService, SocialKakaoService, SocialService],
  exports: [SocialService]
})
export class SocialModule {}