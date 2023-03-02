import { ConflictException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateMeetupDto } from '../dto/create-meetup.dto';
import { Join } from '../entities/join.entity';
import { MeetupsRepository } from '../meetups.repository';
import { MeetupsService } from '../meetups.service';

class mockMeetupsRepository {
  getMeetups() {
    return [];
  }
  createMeetup() {}
  getMeetup() {
    return {
      userId: 1,
      headcount: 2,
      joins: [
        {}
      ]
    };
  }
  delete() {}
}
class mockJoinRepository {
  findOne() {
    return {
      meetupId: 1,
      userId: 1
    };
  }
}
class mockDataSource {

}

describe('MeetupsService', () => {
  let service: MeetupsService;
  let meetupRepository: MeetupsRepository;
  let joinRepository: Repository<Join>;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetupsService,
        MeetupsRepository,
        DataSource,
        {
          provide: MeetupsRepository,
          useClass: mockMeetupsRepository,
        },
        {
          provide: getRepositoryToken(Join),
          useClass: mockJoinRepository,
        },
        {
          provide: DataSource,
          useClass: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<MeetupsService>(MeetupsService);
    meetupRepository = module.get<MeetupsRepository>(MeetupsRepository);
    joinRepository = module.get<Repository<Join>>(getRepositoryToken(Join));
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMeetups Method', () => {
    it('success', async () => {
      const spy = jest.spyOn(meetupRepository, 'getMeetups');
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
      const spy = jest.spyOn(meetupRepository, 'createMeetup');
      await service.createMeetup(meetupDto);
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(meetupDto);
    });
  });

  describe('getMeetup Method', () => {
    const id = 1;
    it('success', async () => {
      const spy = jest.spyOn(meetupRepository, 'getMeetup');
      const result = await service.getMeetup(id);
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(id);
      expect(result).toBeInstanceOf(Object);
    });
  });

  describe('deleteMeetup Method', () => {
    const meetupId = 1;
    const existUser = 1;
    const notExistUser = 2;
    it('success', async () => {
        const getMeetupSpy = jest.spyOn(meetupRepository, 'getMeetup');
      const deleteSpy = jest.spyOn(meetupRepository, 'delete');
      await service.deleteMeetup(meetupId, existUser);
      expect(getMeetupSpy).toHaveBeenCalled();
      expect(getMeetupSpy).toHaveBeenCalledWith(meetupId);
      expect(deleteSpy).toHaveBeenCalled();
      expect(deleteSpy).toHaveBeenCalledWith(meetupId);
    });
    it('fail - Not the one who created the meetup', async () => {
      const getMeetupSpy = jest.spyOn(meetupRepository, 'getMeetup');
      try {
        await service.deleteMeetup(meetupId, notExistUser);
      } catch (err) {
        expect(getMeetupSpy).toHaveBeenCalled();
        expect(getMeetupSpy).toHaveBeenCalledWith(meetupId);
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('getJoin Method', () => {
    const meetupId = 1;
    const userId = 1;
    it('success', async () => {
      const spy = jest.spyOn(joinRepository, 'findOne');
      const result = await service.getJoin(meetupId, userId);
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith({
        where: { meetupId, userId },
      });
      expect(result).toBeInstanceOf(Object);
    });
  });

  describe('addJoin Method', () => {
    const meetupId = 1;
    const alreadyJoinUser = 1;
    const userId = 2;
    it('fail - already join', async () => {
      const getMeetupSpy = jest.spyOn(meetupRepository, 'getMeetup');
      const findOneSpy = jest.spyOn(joinRepository, 'findOne');
      try {
        await service.addJoin(meetupId, alreadyJoinUser);
      } catch (err) {
        expect(getMeetupSpy).toHaveBeenCalled();
        expect(getMeetupSpy).toHaveBeenCalledWith(meetupId);
        expect(findOneSpy).toHaveBeenCalled();
        expect(findOneSpy).toHaveBeenCalledWith({
          where: { meetupId, userId: alreadyJoinUser },
        });
        expect(err).toBeInstanceOf(ConflictException);
      }
    });
    it('fail - headcount full', async () => {
      // TODO: mockMeetupsRepository의 getMeetup 메서드에 대해
      // headcount를 변경할 방법 필요
    });
    it('success', async () => {
      // TODO: mockJoinRepository findOne 메서드에 대해
      // null로 변경할 방법 필요

      // const getMeetupSpy = jest.spyOn(meetupRepository, 'getMeetup');
      // const findOneSpy = jest.spyOn(joinRepository, 'findOne');
      // await service.addJoin(meetupId, userId);
      // expect(getMeetupSpy).toHaveBeenCalled();
      // expect(getMeetupSpy).toHaveBeenCalledWith(meetupId);
      // expect(findOneSpy).toHaveBeenCalled();
      // expect(findOneSpy).toHaveBeenCalledWith({
      //   where: { meetupId, userId },
      // });
    });
  });
});
