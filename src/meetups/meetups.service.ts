import _ from 'lodash';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateMeetupDto } from './dto/create-meetup.dto';
import { Meetup } from './entities/meetup.entity';
import { MeetupsRepository } from './meetups.repository';

@Injectable()
export class MeetupsService {
  constructor(private meetupsRepository: MeetupsRepository) {}

  async getMeetups(): Promise<Meetup[]> {
    return await this.meetupsRepository.getMeetups();
  }

  async createMeetup(meetupDto: CreateMeetupDto): Promise<void> {
    await this.meetupsRepository.createMeetup(meetupDto);
  }

  async getMeetup(meetupId: number): Promise<Meetup> {
    return await this.meetupsRepository.getMeetup(meetupId);
  }

  async deleteMeetup(meetupId: number, userId: number) {
    const meetup = await this.getMeetup(meetupId);
    if (userId !== meetup.userId) {
      throw new ForbiddenException(`모임을 만든 사람만 삭제할 수 있습니다.`);
    }
    await this.meetupsRepository.delete(meetupId);
  }
}
