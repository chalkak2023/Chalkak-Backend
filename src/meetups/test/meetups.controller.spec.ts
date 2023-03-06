import { Test, TestingModule } from '@nestjs/testing';
import { CreateMeetupDTO } from '../dto/create-meetup.dto';
import { MeetupsController } from '../meetups.controller';
import { MeetupsService } from '../meetups.service';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { Meetup } from '../entities/meetup.entity';
import { decodedAccessTokenDTO } from 'src/auth/dto/auth.dto';

const moduleMocker = new ModuleMocker(global);

describe('MeetupsController', () => {
  let controller: MeetupsController;
  let mockService: jest.Mocked<MeetupsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeetupsController],
    }).useMocker((token) => {
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

  describe('POST /api/meetups', () => {
    const meetupDTO: CreateMeetupDTO = {
      userId: 1,
      title: 'test title',
      content: 'test content',
      place: 'test place',
      schedule: '2023-02-28 17:20',
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
      mockService.addJoin.mockResolvedValue();
      await controller.addJoin(meetupId, userDTO);

      expect(mockService.addJoin).toHaveBeenCalled();
      expect(mockService.addJoin).toHaveBeenCalledWith(meetupId, userDTO.id);
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
});
