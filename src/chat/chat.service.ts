import { Injectable } from '@nestjs/common';
import { Meetup } from 'src/meetups/entities/meetup.entity';
import { ChatRepository } from './chat.repository';

@Injectable()
export class ChatService {
  constructor(
    private chatRepository: ChatRepository,
  ) {}

  async getChats(userId: number): Promise<Meetup[]> {
    return await this.chatRepository.getChats(userId);
  }
}
