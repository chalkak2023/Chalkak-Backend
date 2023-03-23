import _ from 'lodash';
import { Injectable } from '@nestjs/common';
import { Meetup } from 'src/meetups/entities/meetup.entity';
import { ChatRepository } from './chat.repository';
import { ChatDTO } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
  ) {}

  async getChatRooms(userId: number): Promise<Meetup[]> {
    return await this.chatRepository.getChatRooms(userId);
  }

  async exitChatRoom(meetupId: number, userId: number): Promise<void> {
    await this.chatRepository.exitChatRoom(meetupId, userId);
  }

  async addChat(chatObj: ChatDTO) {
    await this.chatRepository.insert(chatObj);
  }

  async getChats(roomId: string): Promise<ChatDTO[]> {
    return await this.chatRepository.find({ where: { roomId } });
  }
}