import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMeetupDto } from './dto/create-meetup.dto';
import { Meetup } from './entities/meetup.entity';
import { MeetupsRepository } from './meetups.repository';

@Injectable()
export class MeetupsService {
  constructor(
    // @InjectRepository(Meetup) private meetupRepository: Repository<Meetup>,
    private meetupsRepository: MeetupsRepository
  ) {}

  async getMeetups(): Promise<Meetup[]> {
    return await this.meetupsRepository.getMeetups();
  }

  async createMeetup(meetupDto: CreateMeetupDto): Promise<void> {
    await this.meetupsRepository.createMeetup(meetupDto);
  }
}
