import { Test, TestingModule } from '@nestjs/testing';
import { CreateMeetupDto } from '../dto/create-meetup.dto';
import { MeetupsRepository } from '../meetups.repository';

class mockMeetupsRepository {
  getMeetups() {
    return [];
  }
  createMeetup() {
    return [];
  }
}

describe('MeetupsRepository', () => {
  let repository: MeetupsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetupsRepository,
        {
          provide: MeetupsRepository,
          useClass: mockMeetupsRepository,
        },
      ],
    }).compile();

    repository = module.get<MeetupsRepository>(MeetupsRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getMeetups', () => {
    it('should return array', async () => {
      const spy = jest.spyOn(repository, 'getMeetups');
      const result = repository.getMeetups();
      expect(spy).toHaveBeenCalledWith();
      expect(result).toBeInstanceOf(Array);
    });
    it('should return error', async () => {
      jest.spyOn(repository, 'getMeetups').mockImplementation(() => {
        throw new Error('error');
      });
      try {
        await repository.getMeetups();
      } catch (err) {
        expect(err.message).toContain('error');
      }
    });
  });

  describe('createMeetup', () => {
    const meetupDto: CreateMeetupDto = {
      userId: 0,
      title: 'test title',
      content: 'test content',
      place: 'test place',
      schedule: '2023-02-28 17:20',
      headcount: 0,
    };
    it('should create', async () => {
      const spy = jest.spyOn(repository, 'createMeetup');
      const result = repository.createMeetup(meetupDto);
      expect(spy).toHaveBeenCalledWith(meetupDto);
      expect(result).toBeInstanceOf(Array);
    });
    it('should return error', async () => {
      jest.spyOn(repository, 'createMeetup').mockImplementation(() => {
        throw new Error('error');
      });
      try {
        await repository.createMeetup(meetupDto);
      } catch (err) {
        expect(err.message).toContain('error');
      }
    });
  });
});
