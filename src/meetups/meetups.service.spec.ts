import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meetup } from './entities/meetup.entity';
import { MeetupsService } from './meetups.service';

describe('MeetupsService', () => {
  let service: MeetupsService;
  let repository: Repository<Meetup>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetupsService,
        {
          provide: getRepositoryToken(Meetup),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<MeetupsService>(MeetupsService);
    repository = module.get<Repository<Meetup>>(getRepositoryToken(Meetup));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMeetups', () => {
    it('should return hi', () => {
      const result = service.getMeetups();
      expect(result).toEqual('hi');
    });
    it('it must generate an error, getMeetups return an error', async () => {
      jest.spyOn(service, 'getMeetups').mockImplementation(() => {
        throw new Error('error');
      });
      try {
        await service.getMeetups();
      } catch (err) {
        expect(err.message).toContain('error');
      }
    });
  });
});
