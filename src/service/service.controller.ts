import { Body, Controller, Get } from '@nestjs/common';
import { Faq } from 'src/admin/entities/faq.entity';
import { ServiceService } from 'src/service/service.service';

@Controller('/api/service')
export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  // 서비스페이지 자주찾는질문
  @Get('faq')
  async getFaqList(@Body('id') id: number): Promise<Faq[]> {
    return await this.serviceService.getFaqList(id);
  }
}
