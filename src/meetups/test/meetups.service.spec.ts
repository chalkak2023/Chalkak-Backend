import { Test, TestingModule } from '@nestjs/testing';
import { CreateMeetupDto } from '../dto/create-meetup.dto';
import { MeetupsRepository } from '../meetups.repository';
import { MeetupsService } from '../meetups.service';

class mockMeetupsRepository {
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

describe('MeetupsService', () => {
  let service: MeetupsService;
  let repository: MeetupsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetupsService,
        MeetupsRepository,
        {
          provide: MeetupsRepository,
          useClass: mockMeetupsRepository,
        },
      ],
    }).compile();

    service = module.get<MeetupsService>(MeetupsService);
    repository = module.get<MeetupsRepository>(MeetupsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMeetups Method', () => {
    it('success', async () => {
      const spy = jest.spyOn(repository, 'getMeetups');
      const result = await service.getMeetups();
      expect(spy).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Array);
    });
    // it('should return error', async () => {
    //   jest.spyOn(repository, 'getMeetups').mockImplementation(() => {
    //     throw new Error('error');
    //   });
    //   try {
    //     await service.getMeetups();
    //   } catch (err) {
    //     expect(err.message).toEqual('error');
    //   }
    // });
  });

  describe('createMeetup Method', () => {
    const meetupDto: CreateMeetupDto = {
      userId: 0,
      title: 'test title',
      content: 'test content',
      place: 'test place',
      schedule: '2023-02-28 17:20',
      headcount: 0,
    };
    it('success', async () => {
      const spy = jest.spyOn(repository, 'createMeetup');
      await service.createMeetup(meetupDto);
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(meetupDto);
    });
  });

  describe('getMeetup Method', () => {
    const id = 1;
    it('success', async () => {
      const spy = jest.spyOn(repository, 'getMeetup');
      const result = await service.getMeetup(id);
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(id);
      expect(result).toBeInstanceOf(Object);
    });
  });
});
