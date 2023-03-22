import _ from 'lodash';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Join } from 'src/meetups/entities/join.entity';
import { Meetup } from 'src/meetups/entities/meetup.entity';
import { Repository } from 'typeorm';
import { ChatRepository } from './chat.repository';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    @InjectRepository(Join) private joinRepository: Repository<Join>,
  ) {}

  async getChats(userId: number): Promise<Meetup[]> {
    return await this.chatRepository.getChats(userId);
  }

  async exitChat(meetupId: number, userId: number): Promise<void> {
    await this.chatRepository.exitChat(meetupId, userId);
  }
}