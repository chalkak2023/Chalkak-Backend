import { Injectable } from '@nestjs/common';
import { CreateMeetupDto } from './dto/create-meetup.dto';
import { Meetup } from './entities/meetup.entity';
import { MeetupsRepository } from './meetups.repository';

@Injectable()
export class MeetupsService {
  constructor(
    private meetupsRepository: MeetupsRepository
  ) {}

  async getMeetups(): Promise<Meetup[]> {
    return await this.meetupsRepository.getMeetups();
  }

  async createMeetup(meetupDto: CreateMeetupDto): Promise<void> {
    await this.meetupsRepository.createMeetup(meetupDto);
  }

  async getMeetup(id: number): Promise<Meetup> {
    return await this.meetupsRepository.getMeetup(id);
  }
}
