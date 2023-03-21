import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meetup } from 'src/meetups/entities/meetup.entity';
import { Join } from 'src/meetups/entities/join.entity';
import { ChatRepository } from './chat.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Meetup, Join])],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService, ChatRepository]
})
export class ChatModule {}
