import { Controller, Get } from '@nestjs/common';
import { InjectUser, UserGuard } from 'src/auth/auth.decorator';
import { decodedAccessTokenDTO } from 'src/auth/dto/auth.dto';
import { Meetup } from 'src/meetups/entities/meetup.entity';
import { ChatService } from './chat.service';

@Controller('api/chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @UserGuard
  async getChats(@InjectUser() userDTO: decodedAccessTokenDTO): Promise<Meetup[]> {
    return await this.chatService.getChats(userDTO.id);
  }
}
