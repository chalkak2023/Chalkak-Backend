import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateMeetupDto } from '../dto/create-meetup.dto';
import { MeetupsRepository } from '../meetups.repository';
import { MeetupsService } from '../meetups.service';

class mockMeetupsRepository {
  getMeetups() {
    return [];
  }
  createMeetup() {}
  getMeetup() {
    return {
      userId: 1
    };
  }
  delete() {}
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

  describe('deleteMeetup Method', () => {
    const meetupId = 1;
    const exist_user = 1;
    const not_exist_user = 2;
    it('success', async () => {
        const getMeetupSpy = jest.spyOn(repository, 'getMeetup');
      const deleteSpy = jest.spyOn(repository, 'delete');
      await service.deleteMeetup(meetupId, exist_user);
      expect(getMeetupSpy).toHaveBeenCalled();
      expect(getMeetupSpy).toHaveBeenCalledWith(meetupId);
      expect(deleteSpy).toHaveBeenCalled();
      expect(deleteSpy).toHaveBeenCalledWith(meetupId);
    });
    it('fail - NotFoundException', async () => {
      const getMeetupSpy = jest.spyOn(repository, 'getMeetup');
      try {
        await service.deleteMeetup(meetupId, not_exist_user);
      } catch (err) {
        expect(getMeetupSpy).toHaveBeenCalled();
        expect(getMeetupSpy).toHaveBeenCalledWith(meetupId);
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
  });
});
