import { Body, Controller, Get } from '@nestjs/common';
import { Faq } from 'src/admin/entities/faq.entity';
import { GuideService } from 'src/guide/guide.service';

@Controller('/api/service')
export class GuideController {
  constructor(private guideService: GuideService) { }

  // 서비스 이용안내 페이지 자주찾는질문
  @Get('faq')
  async getFaqList(@Body('id') id: number): Promise<Faq[]> {
    return await this.guideService.getFaqList(id);
  }
}
