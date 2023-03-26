import { CACHE_MANAGER } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { decodedAccessTokenDTO } from 'src/auth/dto/auth.dto';
import { Meetup } from 'src/meetups/entities/meetup.entity';
import { ChatController } from '../chat.controller';
import { ChatService } from '../chat.service';
import { ChatDTO } from '../dto/chat.dto';

const moduleMocker = new ModuleMocker(global);

describe('ChatController', () => {
  let controller: ChatController;
  let mockService: jest.Mocked<ChatService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
    }).useMocker((token) => {
      if (token === CACHE_MANAGER) {
        return {
          get: jest.fn(),
          set: jest.fn(),
          del: jest.fn(),
        };
      }
      if (typeof token === 'function') {
        const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
        const Mock = moduleMocker.generateFromMetadata(mockMetadata);
        return new Mock();
      }
    }).compile();

    controller = module.get(ChatController);
    mockService = module.get(ChatService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /api/chats', () => {
    const userDTO: decodedAccessTokenDTO = {
      id: 1,
      username: 'test',
      email: 'test@gmail.com',
      role: 'user',
      iat: 0,
      exp: 0
    }
    it('getChatRooms', async () => {
      const mockReturnValue = [new Meetup()];
      mockService.getChatRooms.mockResolvedValue(mockReturnValue);
      const result = await controller.getChatRooms(userDTO);

      expect(result).toBe(mockReturnValue);
      expect(mockService.getChatRooms).toHaveBeenCalled();
      expect(mockService.getChatRooms).toHaveBeenCalledWith(userDTO.id);
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('DELETE /api/chats/:chatId', () => {
    const userDTO: decodedAccessTokenDTO = {
      id: 1,
      username: 'test',
      email: 'test@gmail.com',
      role: 'user',
      iat: 0,
      exp: 0
    }
    it('exitChatRoom', async () => {
      const chatId = 1;
      mockService.exitChatRoom.mockResolvedValue();
      const result = await controller.exitChatRoom(chatId, userDTO);

      expect(mockService.exitChatRoom).toHaveBeenCalled();
      expect(mockService.exitChatRoom).toHaveBeenCalledWith(chatId, userDTO.id);
    });
  });

  describe('GET /api/chats/:chatId', () => {
    it('getChats', async () => {
      const roomId = '1';
      const mockReturnValue = [new ChatDTO()];
      mockService.getChats.mockResolvedValue(mockReturnValue);
      const result = await controller.getChats(roomId);

      expect(result).toBe(mockReturnValue);
      expect(mockService.getChats).toHaveBeenCalled();
      expect(mockService.getChats).toHaveBeenCalledWith(roomId);
      expect(result).toBeInstanceOf(Array);
    });
  });
});
