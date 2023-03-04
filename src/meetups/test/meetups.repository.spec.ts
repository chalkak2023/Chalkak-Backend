import { Test, TestingModule } from '@nestjs/testing';
import { CreateMeetupDTO } from '../dto/create-meetup.dto';
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
});
