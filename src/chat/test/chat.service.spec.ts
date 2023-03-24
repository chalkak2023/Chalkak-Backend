import { Test, TestingModule } from '@nestjs/testing';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { Meetup } from 'src/meetups/entities/meetup.entity';
import { ChatRepository } from '../chat.repository';
import { ChatService } from '../chat.service';
import { ChatDTO } from '../dto/chat.dto';
import { Chat } from '../entities/chat.entity';

const moduleMocker = new ModuleMocker(global);

describe('ChatService', () => {
  let service: ChatService;
  let mockChatRepository: jest.Mocked<ChatRepository>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatService],
    }).useMocker((token) => {
      if (typeof token === 'function') {
        const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
        const Mock = moduleMocker.generateFromMetadata(mockMetadata);
        return new Mock();
      }
    }).compile();

    service = module.get(ChatService);
    mockChatRepository = module.get(ChatRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getChatRooms Method', () => {
    const userId = 1;
    it('success', async () => {
      const mockReturnValue = [new Meetup()];
      mockChatRepository.getChatRooms.mockResolvedValue(mockReturnValue);
      const result = await service.getChatRooms(userId);

      expect(result).toBe(mockReturnValue);
      expect(mockChatRepository.getChatRooms).toHaveBeenCalled();
      expect(mockChatRepository.getChatRooms).toHaveBeenCalledWith(userId);
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('exitChatRoom Method', () => {
    const meetupId = 1;
    const userId = 1;
    it('success', async () => {
      mockChatRepository.exitChatRoom.mockResolvedValue();
      await service.exitChatRoom(meetupId, userId);

      expect(mockChatRepository.exitChatRoom).toHaveBeenCalled();
      expect(mockChatRepository.exitChatRoom).toHaveBeenCalledWith(meetupId, userId);
    });
  });

  describe('addChat Method', () => {
    const chatObj = new ChatDTO();
    it('success', async () => {
      const mockReturnValue = { identifiers: [], generatedMaps: [], raw: false };
      mockChatRepository.insert.mockResolvedValue(mockReturnValue);
      await service.addChat(chatObj);

      expect(mockChatRepository.insert).toHaveBeenCalled();
      expect(mockChatRepository.insert).toHaveBeenCalledWith(chatObj);
    });
  });

  describe('getChats Method', () => {
    const roomId = '1';
    it('success', async () => {
      const mockReturnValue = [new Chat()];
      mockChatRepository.find.mockResolvedValue(mockReturnValue);
      const result = await service.getChats(roomId);

      expect(result).toBe(mockReturnValue);
      expect(mockChatRepository.find).toHaveBeenCalled();
      expect(mockChatRepository.find).toHaveBeenCalledWith({ where: { roomId } });
      expect(result).toBeInstanceOf(Array);
    });
  });
});
