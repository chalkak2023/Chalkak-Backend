import _ from 'lodash';
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Join } from 'src/meetups/entities/join.entity';
import { Meetup } from 'src/meetups/entities/meetup.entity';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class JoinService {
  constructor(
    @InjectRepository(Join) private joinRepository: Repository<Join>,
    @InjectRepository(Meetup) private meetupsRepository: Repository<Meetup>,
    private eventEmitter: EventEmitter2
  ) {}

  async addJoin(meetupId: number, userId: number, eventName: string) {
    const join = await this.joinRepository.findOne({
      where: { meetupId, userId },
    });
    if (!_.isNil(join)) {
      this.eventEmitter.emit(eventName, {success: false, exception: new ConflictException(`이미 참여하고 있는 유저입니다.`)})
      return;
      // throw new ConflictException(`이미 참여하고 있는 유저입니다.`);
    }

    const meetup = await this.meetupsRepository.findOne({
      where: { id: meetupId }
    });
    if (_.isNil(meetup)) {
      this.eventEmitter.emit(eventName, {success: false, exception: new NotFoundException(`해당 모임을 찾을 수 없습니다.`)})
      return;
      // throw new NotFoundException(`해당 모임을 찾을 수 없습니다.`);
    }

    const joinMembers = await this.joinRepository.count({
      where: { meetupId }
    });
    if (meetup.headcount <= joinMembers) {
      this.eventEmitter.emit(eventName, {success: false, exception: new ForbiddenException('정원이 다 찼습니다.')})
      return;
      // throw new ForbiddenException('정원이 다 찼습니다.');
    }
    
    await this.joinRepository.insert({
      meetupId, userId
    });
    this.eventEmitter.emit(eventName, {success: true})
    // await this.meetupsRepository.addJoin(meetupId, userId, meetup.joins.length);
  }
}
