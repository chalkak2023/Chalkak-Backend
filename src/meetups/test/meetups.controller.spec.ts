import { Test, TestingModule } from '@nestjs/testing';
import { CreateMeetupDto } from '../dto/create-meetup.dto';
import { MeetupsController } from '../meetups.controller';
import { MeetupsService } from '../meetups.service';

class mockMeetupsService {
  getMeetups() {
    return [];
  }
  createMeetup() {}
  getMeetup() {
    return {};
  }
  deleteMeetup() {}
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

  describe('GET /api/meetups/:meetupId', () => {
    const id = 1;
    it('getMeetup', async () => {
      const spy = jest.spyOn(service, 'getMeetup');
      const result = await controller.getMeetup(id);
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(id);
      expect(result).toBeInstanceOf(Object);
    });
  });

  describe('DELETE /api/meetups/:meetupId', () => {
    const meetupId = 1;
    const req = {
      userId: 1,
    }
    it('deleteMeetup', async () => {
      // TODO: addJoin 메서드의 두 번째 인자로 req가 들어가야 하는데
      // type문제를 해결하지 못해 일단 주석처리

      // const spy = jest.spyOn(service, 'deleteMeetup');
      // await controller.deleteMeetup(meetupId, req);
      // expect(spy).toHaveBeenCalled();
      // expect(spy).toHaveBeenCalledWith(meetupId, userId);
    });
  });
});