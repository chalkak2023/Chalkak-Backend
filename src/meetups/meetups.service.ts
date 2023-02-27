import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meetup } from './entities/meetup.entity';

@Injectable()
export class MeetupsService {
  constructor(
    @InjectRepository(Meetup) private meetupRepository: Repository<Meetup>,
  ) {}

  getMeetups(): string {
    return 'hi';
  }
}
