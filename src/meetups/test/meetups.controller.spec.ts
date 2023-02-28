import { Test, TestingModule } from '@nestjs/testing';
import { CreateMeetupDto } from '../dto/create-meetup.dto';
import { MeetupsController } from '../meetups.controller';
import { MeetupsService } from '../meetups.service';

class mockMeetupsService {
  getMeetups() {
    return [];
  }
  createMeetup() {
    return [];
  }
  getMeetup() {
    return {};
  }
}

describe('MeetupsController', () => {
  let controller: MeetupsController;
  let service: MeetupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeetupsController],
      providers: [
        MeetupsService,
        {
          provide: MeetupsService,
          useClass: mockMeetupsService,
        },
      ],
    }).compile();

    controller = module.get<MeetupsController>(MeetupsController);
    service = module.get<MeetupsService>(MeetupsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /api/meetups', () => {
    it('getMeetups', async () => {
      const spy = jest.spyOn(service, 'getMeetups');
      const result = await controller.getMeetups();
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith();
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/meetups', () => {
    const meetupDto: CreateMeetupDto = {
      userId: 0,
      title: 'test title',
      content: 'test content',
      place: 'test place',
      schedule: '2023-02-28 17:20',
      headcount: 0,
    };
    it('createMeetup', async () => {
      const spy = jest.spyOn(service, 'createMeetup');
      await controller.createMeetup(meetupDto);
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(meetupDto);
    });
  });

  describe('GET /api/meetup', () => {
    const id = 1;
    it('getMeetup', async () => {
      const spy = jest.spyOn(service, 'getMeetup');
      const result = await controller.getMeetup(id);
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(id);
      expect(result).toBeInstanceOf(Object);
    });
  });
});
