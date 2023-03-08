import _ from 'lodash';
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Join } from 'src/meetups/entities/join.entity';
import { Meetup } from 'src/meetups/entities/meetup.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JoinService {
  constructor(
    @InjectRepository(Join) private joinRepository: Repository<Join>,
    @InjectRepository(Meetup) private meetupsRepository: Repository<Meetup>,
  ) {}

  async addJoin(meetupId: number, userId: number) {
    const join = await this.joinRepository.findOne({
      where: { meetupId, userId },
    });
    if (!_.isNil(join)) {
      throw new ConflictException(`이미 참여하고 있는 유저입니다.`);
    }

    const meetup = await this.meetupsRepository.findOne({
      where: { id: meetupId }
    });
    if (_.isNil(meetup)) {
      throw new NotFoundException(`해당 모임을 찾을 수 없습니다.`);
    }

    const joinMembers = await this.joinRepository.count({
      where: { meetupId }
    });
    if (meetup.headcount <= joinMembers) {
      throw new ForbiddenException('정원이 다 찼습니다.');
    }
    
    await this.joinRepository.insert({
      meetupId, userId
    });
    // await this.meetupsRepository.addJoin(meetupId, userId, meetup.joins.length);
  }
}
