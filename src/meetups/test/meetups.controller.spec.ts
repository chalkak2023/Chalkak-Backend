import { Test, TestingModule } from '@nestjs/testing';
import { CreateMeetupDto } from '../dto/create-meetup.dto';
import { MeetupsController } from '../meetups.controller';
import { MeetupsService } from '../meetups.service';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { Meetup } from '../entities/meetup.entity';
import { decodedAccessTokenDTO } from 'src/auth/dto/auth.dto';

const moduleMocker = new ModuleMocker(global);

describe('MeetupsController', () => {
  let controller: MeetupsController;
  let service: jest.Mocked<MeetupsService>;

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
    service = module.get(MeetupsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /api/meetups', () => {
    it('getMeetups', async () => {
      const mockReturnValue = [new Meetup()];
      service.getMeetups.mockResolvedValue(mockReturnValue);
      const result = await controller.getMeetups();

      expect(result).toBe(mockReturnValue);
      expect(service.getMeetups).toHaveBeenCalled();
      expect(service.getMeetups).toHaveBeenCalledWith();
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/meetups', () => {
    const meetupDTO: CreateMeetupDto = {
      userId: 1,
      title: 'test title',
      content: 'test content',
      place: 'test place',
      schedule: '2023-02-28 17:20',
      headcount: 0,
    };
    const userDTO: decodedAccessTokenDTO = {
      id: 1,
      email: 'test@gmail.com',
      role: 'user',
      iat: 0,
      exp: 0
    }
    it('createMeetup', async () => {
      service.createMeetup.mockResolvedValue();
      await controller.createMeetup(meetupDTO, userDTO);

      expect(service.createMeetup).toHaveBeenCalled();
      expect(service.createMeetup).toHaveBeenCalledWith(meetupDTO);
    });
  });

  describe('GET /api/meetups/:meetupId', () => {
    it('getMeetup', async () => {
      const mockReturnValue = new Meetup();
      const meetupId = 1;
      service.getMeetup.mockResolvedValue(mockReturnValue);
      const result = await controller.getMeetup(meetupId);

      expect(result).toBe(mockReturnValue);
      expect(service.getMeetup).toHaveBeenCalled();
      expect(service.getMeetup).toHaveBeenCalledWith(meetupId);
      expect(result).toBeInstanceOf(Object);
    });
  });

  describe('DELETE /api/meetups/:meetupId', () => {
    const meetupId = 1;
    const userDTO: decodedAccessTokenDTO = {
      id: 1,
      email: 'test@gmail.com',
      role: 'user',
      iat: 0,
      exp: 0
    }
    it('deleteMeetup', async () => {
      service.deleteMeetup.mockResolvedValue();
      await controller.deleteMeetup(meetupId, userDTO);

      expect(service.deleteMeetup).toHaveBeenCalled();
      expect(service.deleteMeetup).toHaveBeenCalledWith(meetupId, userDTO.id);
    });
  });

  describe('POST /api/meetups/:meetupId/join', () => {
    const meetupId = 1;
    const userDTO: decodedAccessTokenDTO = {
      id: 1,
      email: 'test@gmail.com',
      role: 'user',
      iat: 0,
      exp: 0
    }
    it('addJoin', async () => {
      service.addJoin.mockResolvedValue();
      await controller.addJoin(meetupId, userDTO);

      expect(service.addJoin).toHaveBeenCalled();
      expect(service.addJoin).toHaveBeenCalledWith(meetupId, userDTO.id);
    });
  });

  describe('DELETE /api/meetups/:meetupId/join', () => {
    const meetupId = 1;
    const userDTO: decodedAccessTokenDTO = {
      id: 1,
      email: 'test@gmail.com',
      role: 'user',
      iat: 0,
      exp: 0
    }
    it('deleteJoin', async () => {
      service.deleteJoin.mockResolvedValue();
      await controller.deleteJoin(meetupId, userDTO);

      expect(service.deleteJoin).toHaveBeenCalled();
      expect(service.deleteJoin).toHaveBeenCalledWith(meetupId, userDTO.id);
    });
  });
});
