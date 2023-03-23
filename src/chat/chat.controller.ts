import { Controller, Delete, Get, Param } from '@nestjs/common';
import { InjectUser, UserGuard } from 'src/auth/auth.decorator';
import { decodedAccessTokenDTO } from 'src/auth/dto/auth.dto';
import { Meetup } from 'src/meetups/entities/meetup.entity';
import { ChatService } from './chat.service';
import { ChatDTO } from './dto/chat.dto';

@Controller('api/chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @UserGuard
  async getChatRooms(@InjectUser() userDTO: decodedAccessTokenDTO): Promise<Meetup[]> {
    return await this.chatService.getChatRooms(userDTO.id);
  }

  @Delete(':chatId')  // chatId === meetupId
  @UserGuard
  async exitChatRoom(
    @Param('chatId') chatId: number,
    @InjectUser() userDTO: decodedAccessTokenDTO
  ): Promise<void> {
    return await this.chatService.exitChatRoom(chatId, userDTO.id);
  }

  @Get(':roomId')
  @UserGuard
  async getChats(@Param('roomId') roomId: string): Promise<ChatDTO[]> {
    return await this.chatService.getChats(roomId);
  }
}
