import { Test, TestingModule } from '@nestjs/testing';
import { CreateMeetupDTO } from '../dto/create-meetup.dto';
import { MeetupsController } from '../meetups.controller';
import { MeetupsService } from '../meetups.service';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { Meetup } from '../entities/meetup.entity';
import { decodedAccessTokenDTO } from 'src/auth/dto/auth.dto';
import { CACHE_MANAGER } from '@nestjs/common';

const moduleMocker = new ModuleMocker(global);

describe('MeetupsController', () => {
  let controller: MeetupsController;
  let mockService: jest.Mocked<MeetupsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeetupsController],
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

    controller = module.get(MeetupsController);
    mockService = module.get(MeetupsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /api/meetups', () => {
    const page = 1;
    const pageUnderOne = 0;
    const keyword = 'keyword';
    it('getMeetups', async () => {
      const mockReturnValue = [new Meetup()];
      mockService.getMeetups.mockResolvedValue(mockReturnValue);
      const result = await controller.getMeetups(page, keyword);

      expect(result).toBe(mockReturnValue);
      expect(mockService.getMeetups).toHaveBeenCalled();
      expect(mockService.getMeetups).toHaveBeenCalledWith(page, keyword);
      expect(result).toBeInstanceOf(Array);
    });
    it('getMeetups - page is less than 1', async () => {
      const mockReturnValue = [new Meetup()];
      mockService.getMeetups.mockResolvedValue(mockReturnValue);
      const result = await controller.getMeetups(pageUnderOne, keyword);

      expect(result).toBe(mockReturnValue);
      expect(mockService.getMeetups).toHaveBeenCalled();
      expect(mockService.getMeetups).toHaveBeenCalledWith(page, keyword);
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/meetups/joined', () => {
    const page = 1;
    const pageUnderOne = 0;
    const keyword = 'keyword';
    const userDTO: decodedAccessTokenDTO = {
      id: 1,
      username: 'test',
      email: 'test@gmail.com',
      role: 'user',
      iat: 0,
      exp: 0
    }
    it('getMeetupsWithJoined', async () => {
      const mockReturnValue = [new Meetup()];
      mockService.getMeetupsWithJoined.mockResolvedValue(mockReturnValue);
      const result = await controller.getMeetupsWithJoined(page, keyword, userDTO);

      expect(result).toBe(mockReturnValue);
      expect(mockService.getMeetupsWithJoined).toHaveBeenCalled();
      expect(mockService.getMeetupsWithJoined).toHaveBeenCalledWith(userDTO.id, page, keyword);
      expect(result).toBeInstanceOf(Array);
    });
    it('getMeetupsWithJoined - page is less than 1', async () => {
      const mockReturnValue = [new Meetup()];
      mockService.getMeetupsWithJoined.mockResolvedValue(mockReturnValue);
      const result = await controller.getMeetupsWithJoined(pageUnderOne, keyword, userDTO);

      expect(result).toBe(mockReturnValue);
      expect(mockService.getMeetupsWithJoined).toHaveBeenCalled();
      expect(mockService.getMeetupsWithJoined).toHaveBeenCalledWith(userDTO.id, page, keyword);
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/meetups/mine', () => {
    const page = 1;
    const pageUnderOne = 0;
    const keyword = 'keyword';
    const userDTO: decodedAccessTokenDTO = {
      id: 1,
      username: 'test',
      email: 'test@gmail.com',
      role: 'user',
      iat: 0,
      exp: 0
    }
    it('getMeetupsWithMine', async () => {
      const mockReturnValue = [new Meetup()];
      mockService.getMeetupsWithMine.mockResolvedValue(mockReturnValue);
      const result = await controller.getMeetupsWithMine(page, keyword, userDTO);

      expect(result).toBe(mockReturnValue);
      expect(mockService.getMeetupsWithMine).toHaveBeenCalled();
      expect(mockService.getMeetupsWithMine).toHaveBeenCalledWith(userDTO.id, page, keyword);
      expect(result).toBeInstanceOf(Array);
    });
    it('getMeetupsWithMine - page is less than 1', async () => {
      const mockReturnValue = [new Meetup()];
      mockService.getMeetupsWithMine.mockResolvedValue(mockReturnValue);
      const result = await controller.getMeetupsWithMine(pageUnderOne, keyword, userDTO);

      expect(result).toBe(mockReturnValue);
      expect(mockService.getMeetupsWithMine).toHaveBeenCalled();
      expect(mockService.getMeetupsWithMine).toHaveBeenCalledWith(userDTO.id, page, keyword);
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/meetups', () => {
    const meetupDTO: CreateMeetupDTO = {
      userId: 1,
      title: 'test title',
      content: 'test content',
      place: 'test place',
      schedule: new Date('2023-02-28 17:20'),
      headcount: 0,
    };
    const userDTO: decodedAccessTokenDTO = {
      id: 1,
      username: 'test',
      email: 'test@gmail.com',
      role: 'user',
      iat: 0,
      exp: 0
    }
    it('createMeetup', async () => {
      mockService.createMeetup.mockResolvedValue();
      await controller.createMeetup(meetupDTO, userDTO);

      expect(mockService.createMeetup).toHaveBeenCalled();
      expect(mockService.createMeetup).toHaveBeenCalledWith(meetupDTO);
    });
  });

  describe('GET /api/meetups/:meetupId', () => {
    it('getMeetup', async () => {
      const mockReturnValue = new Meetup();
      const meetupId = 1;
      mockService.getMeetup.mockResolvedValue(mockReturnValue);
      const result = await controller.getMeetup(meetupId);

      expect(result).toBe(mockReturnValue);
      expect(mockService.getMeetup).toHaveBeenCalled();
      expect(mockService.getMeetup).toHaveBeenCalledWith(meetupId);
      expect(result).toBeInstanceOf(Object);
    });
  });

  describe('DELETE /api/meetups/:meetupId', () => {
    const meetupId = 1;
    const userDTO: decodedAccessTokenDTO = {
      id: 1,
      username: 'test',
      email: 'test@gmail.com',
      role: 'user',
      iat: 0,
      exp: 0
    }
    it('deleteMeetup', async () => {
      mockService.deleteMeetup.mockResolvedValue();
      await controller.deleteMeetup(meetupId, userDTO);

      expect(mockService.deleteMeetup).toHaveBeenCalled();
      expect(mockService.deleteMeetup).toHaveBeenCalledWith(meetupId, userDTO.id);
    });
  });

  describe('POST /api/meetups/:meetupId/join', () => {
    const meetupId = 1;
    const userDTO: decodedAccessTokenDTO = {
      id: 1,
      username: 'test',
      email: 'test@gmail.com',
      role: 'user',
      iat: 0,
      exp: 0
    }
    it('addJoin', async () => {
      mockService.addJoinQueue.mockResolvedValue({});
      await controller.addJoin(meetupId, userDTO);

      expect(mockService.addJoinQueue).toHaveBeenCalled();
      expect(mockService.addJoinQueue).toHaveBeenCalledWith(meetupId, userDTO.id);
    });
  });

  describe('DELETE /api/meetups/:meetupId/join', () => {
    const meetupId = 1;
    const userDTO: decodedAccessTokenDTO = {
      id: 1,
      username: 'test',
      email: 'test@gmail.com',
      role: 'user',
      iat: 0,
      exp: 0
    }
    it('deleteJoin', async () => {
      mockService.deleteJoin.mockResolvedValue();
      await controller.deleteJoin(meetupId, userDTO);

      expect(mockService.deleteJoin).toHaveBeenCalled();
      expect(mockService.deleteJoin).toHaveBeenCalledWith(meetupId, userDTO.id);
    });
  });

  describe('POST /api/meetups/:meetupId/chat', () => {
    const meetupId = 1;
    const userDTO: decodedAccessTokenDTO = {
      id: 1,
      username: 'test',
      email: 'test@gmail.com',
      role: 'user',
      iat: 0,
      exp: 0
    }
    it('addChat', async () => {
      mockService.addChat.mockResolvedValue();
      await controller.addChat(meetupId, userDTO);

      expect(mockService.addChat).toHaveBeenCalled();
      expect(mockService.addChat).toHaveBeenCalledWith(meetupId, userDTO.id);
    });
  });
});
