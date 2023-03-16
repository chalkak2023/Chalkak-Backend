import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import _ from 'lodash';
import { Faq } from 'src/admin/entities/faq.entity';

@Injectable()
export class ServiceService {
  constructor(@InjectRepository(Faq) private adminFaqRepository: Repository<Faq>) {}

  async getFaqList(id: number): Promise<Faq[]> {
    const faq = await this.adminFaqRepository.find({ where: { id } });
    if (_.isNil(faq)) {
      throw new NotFoundException('자주찾는질문을 찾을 수 없습니다.');
    }
    return faq;
  }
}
