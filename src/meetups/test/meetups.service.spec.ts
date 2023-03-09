import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMeetupDTO } from '../dto/create-meetup.dto';
import { Join } from '../entities/join.entity';
import { MeetupsRepository } from '../meetups.repository';
import { MeetupsService } from '../meetups.service';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { Meetup } from '../entities/meetup.entity';
import Bull, { Queue } from 'bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getQueueToken } from '@nestjs/bull';

const moduleMocker = new ModuleMocker(global);

describe('MeetupsService', () => {
  let service: MeetupsService;
  let mockMeetupRepository: jest.Mocked<MeetupsRepository>;
  let mockJoinRepository: jest.Mocked<Repository<Join>>;
  let mockJoinQueue: jest.Mocked<Queue>;
  let mockEventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [MeetupsService],
    }).useMocker((token) => {
      if (token === getRepositoryToken(Join)) {
        return {
          findOne: jest.fn(),
          insert: jest.fn(),
          delete: jest.fn(),
        };
      }
      if (token === getQueueToken('joinQueue')) {
        return {
          add: jest.fn(),
        };
      }
      if (typeof token === 'function') {
        const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
        const Mock = moduleMocker.generateFromMetadata(mockMetadata);
        return new Mock();
      }
    }).compile();

    service = module.get(MeetupsService);
    mockMeetupRepository = module.get(MeetupsRepository);
    mockJoinRepository = module.get(getRepositoryToken(Join));
    mockJoinQueue = module.get(getQueueToken('joinQueue'));
    mockEventEmitter = module.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMeetups Method', () => {
    const page = 1;
    const keyword = 'keyword';
    it('success', async () => {
      const mockReturnValue = [new Meetup()];
      mockMeetupRepository.getMeetups.mockResolvedValue(mockReturnValue);
      const result = await service.getMeetups(page, keyword);

      expect(result).toBe(mockReturnValue);
      expect(mockMeetupRepository.getMeetups).toHaveBeenCalled();
      expect(mockMeetupRepository.getMeetups).toHaveBeenCalledWith(page, keyword);
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('createMeetup Method', () => {
    const meetupDTO: CreateMeetupDTO = {
      userId: 1,
      title: 'test title',
      content: 'test content',
      place: 'test place',
      schedule: '2023-02-28 17:20',
      headcount: 2,
    };
    it('success', async () => {
      mockMeetupRepository.createMeetup.mockResolvedValue();
      await service.createMeetup(meetupDTO);

      expect(mockMeetupRepository.createMeetup).toHaveBeenCalled();
      expect(mockMeetupRepository.createMeetup).toHaveBeenCalledWith(meetupDTO);
    });
  });

  describe('getMeetup Method', () => {
    const meetupId = 1;
    it('success', async () => {
      const mockReturnValue = new Meetup();
      mockMeetupRepository.getMeetup.mockResolvedValue(mockReturnValue);
      const result = await service.getMeetup(meetupId);

      expect(result).toBe(mockReturnValue);
      expect(mockMeetupRepository.getMeetup).toHaveBeenCalled();
      expect(mockMeetupRepository.getMeetup).toHaveBeenCalledWith(meetupId);
      expect(result).toBeInstanceOf(Object);
    });
  });

  describe('deleteMeetup Method', () => {
    const meetupId = 1;
    const userId = 1;
    it('Fail - not creator', async () => {
      const mockReturnValue = new Meetup();
      mockReturnValue.userId = 2;
      mockMeetupRepository.getMeetup.mockResolvedValue(mockReturnValue);
      try {
        await service.deleteMeetup(meetupId, userId);
      } catch (err) {
        expect(mockMeetupRepository.getMeetup).toHaveBeenCalled();
        expect(mockMeetupRepository.getMeetup).toHaveBeenCalledWith(meetupId);
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
    it('Success', async () => {
      const mockReturnValue = new Meetup();
      mockReturnValue.userId = 1;
      mockMeetupRepository.getMeetup.mockResolvedValue(mockReturnValue);
      mockMeetupRepository.delete.mockResolvedValue({raw: false});
      await service.deleteMeetup(meetupId, userId);

      expect(mockMeetupRepository.getMeetup).toHaveBeenCalled();
      expect(mockMeetupRepository.getMeetup).toHaveBeenCalledWith(meetupId);
      expect(mockMeetupRepository.delete).toHaveBeenCalled();
      expect(mockMeetupRepository.delete).toHaveBeenCalledWith(meetupId);
    });
  });

  describe('getJoin Method', () => {
    const meetupId = 1;
    const userId = 1;
    it('success', async () => {
      const mockReturnValue = new Join();
      mockJoinRepository.findOne.mockResolvedValue(mockReturnValue);
      const result = await service.getJoin(meetupId, userId);

      expect(mockJoinRepository.findOne).toHaveBeenCalled();
      expect(mockJoinRepository.findOne).toHaveBeenCalledWith(
        { where: { meetupId, userId } }
      );
      expect(result).toBeInstanceOf(Object);
    });
  });

  describe('addJoin Method', () => {
    const meetupId = 1;
    const userId = 1;
    const eventName = 'eventName';
    it('Fail - already join', async () => {
      const mockFindOneReturnValue = new Join();
      mockJoinRepository.findOne.mockResolvedValue(mockFindOneReturnValue);
      const mockEmitReturnValue = false;
      mockEventEmitter.emit.mockReturnValue(mockEmitReturnValue);

      const result = await service.addJoin(meetupId, userId, eventName);

      expect(mockJoinRepository.findOne).toHaveBeenCalled();
      expect(mockJoinRepository.findOne).toHaveBeenCalledWith(
        { where: { meetupId, userId } }
      );
      expect(mockEventEmitter.emit).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        eventName, { success: false, exception: new ConflictException(`이미 참여하고 있는 유저입니다.`) }
      );
      expect(result).toBe(mockEmitReturnValue);
    });
    it('Fail - headcount full', async () => {
      const mockFindOneReturnValue = null;
      mockJoinRepository.findOne.mockResolvedValue(mockFindOneReturnValue);
      const mockGetMeetupReturnValue = new Meetup();
      mockGetMeetupReturnValue.headcount = 1;
      mockGetMeetupReturnValue.joins = [new Join()];
      mockMeetupRepository.getMeetup.mockResolvedValue(mockGetMeetupReturnValue);
      const mockEmitReturnValue = false;
      mockEventEmitter.emit.mockReturnValue(mockEmitReturnValue);

      const result = await service.addJoin(meetupId, userId, eventName);

      expect(mockJoinRepository.findOne).toHaveBeenCalled();
      expect(mockJoinRepository.findOne).toHaveBeenCalledWith({ 
        where: { meetupId, userId } 
      });
      expect(mockMeetupRepository.getMeetup).toHaveBeenCalled();
      expect(mockMeetupRepository.getMeetup).toHaveBeenCalledWith(meetupId);
      expect(mockEventEmitter.emit).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        eventName, { success: false, exception: new ForbiddenException('정원이 다 찼습니다.') }
      );
      expect(result).toBe(mockEmitReturnValue);
    });
    it('Success', async () => {
      const mockFindOneReturnValue = null;
      mockJoinRepository.findOne.mockResolvedValue(mockFindOneReturnValue);
      const mockGetMeetupReturnValue = new Meetup();
      mockGetMeetupReturnValue.headcount = 2;
      mockGetMeetupReturnValue.joins = [new Join()];
      mockMeetupRepository.getMeetup.mockResolvedValue(mockGetMeetupReturnValue);
      mockJoinRepository.insert.mockResolvedValue({ generatedMaps: [], identifiers: [], raw: false });
      const mockEmitReturnValue = true;
      mockEventEmitter.emit.mockReturnValue(mockEmitReturnValue);

      const result = await service.addJoin(meetupId, userId, eventName);

      expect(mockMeetupRepository.getMeetup).toHaveBeenCalled();
      expect(mockMeetupRepository.getMeetup).toHaveBeenCalledWith(meetupId);
      expect(mockJoinRepository.findOne).toHaveBeenCalled();
      expect(mockJoinRepository.findOne).toHaveBeenCalledWith(
        { where: { meetupId, userId } }
      );
      expect(mockJoinRepository.insert).toHaveBeenCalled();
      expect(mockJoinRepository.insert).toHaveBeenCalledWith(
        { meetupId, userId }
      );
      expect(mockEventEmitter.emit).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        eventName, { success: true }
      );
      expect(result).toBe(mockEmitReturnValue);
    });
  });

  describe('deleteJoin Method', () => {
    const meetupId = 1;
    const userId = 1;
    it('Fail - Not participant', async () => {
      const mockFindOneReturnValue = null;
      mockJoinRepository.findOne.mockResolvedValue(mockFindOneReturnValue);
      try {
        await service.deleteJoin(meetupId, userId);
      } catch (err) {
        expect(mockJoinRepository.findOne).toHaveBeenCalled();
        expect(mockJoinRepository.findOne).toHaveBeenCalledWith(
          { where: { meetupId, userId } }
        );
        expect(err).toBeInstanceOf(BadRequestException);
      }
    });
    it('Fail - He is the host', async () => {
      const mockFindOneReturnValue = new Join();
      mockJoinRepository.findOne.mockResolvedValue(mockFindOneReturnValue);
      const mockGetMeetupReturnValue = new Meetup();
      mockGetMeetupReturnValue.userId = userId;
      mockMeetupRepository.getMeetup.mockResolvedValue(mockGetMeetupReturnValue);
      try {
        await service.deleteJoin(meetupId, userId);
      } catch (err) {
        expect(mockMeetupRepository.getMeetup).toHaveBeenCalled();
        expect(mockMeetupRepository.getMeetup).toHaveBeenCalledWith(meetupId);
        expect(mockJoinRepository.findOne).toHaveBeenCalled();
        expect(mockJoinRepository.findOne).toHaveBeenCalledWith(
          { where: { meetupId, userId } }
        );
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
    it('Success', async () => {
      const mockFindOneReturnValue = new Join();
      mockJoinRepository.findOne.mockResolvedValue(mockFindOneReturnValue);
      const mockGetMeetupReturnValue = new Meetup();
      mockGetMeetupReturnValue.userId = userId + 1;
      mockMeetupRepository.getMeetup.mockResolvedValue(mockGetMeetupReturnValue);
      mockJoinRepository.delete.mockResolvedValue({ raw: false });
      await service.deleteJoin(meetupId, userId);

      expect(mockMeetupRepository.getMeetup).toHaveBeenCalled();
      expect(mockMeetupRepository.getMeetup).toHaveBeenCalledWith(meetupId);
      expect(mockJoinRepository.findOne).toHaveBeenCalled();
      expect(mockJoinRepository.findOne).toHaveBeenCalledWith(
        { where: { meetupId, userId } }
      );
      expect(mockJoinRepository.delete).toHaveBeenCalled();
      expect(mockJoinRepository.delete).toHaveBeenCalledWith(
        { meetupId, userId }
      );
    });
  });

  // describe('waitFinish Method', () => {
  //   const eventName = 'eventName';
  //   const sec = 2;
  //   it('Success', async () => {
  //     const mockRemoveAllListenersReturnValue = new EventEmitter2();
  //     mockEventEmitter.removeAllListeners.mockReturnValue(mockRemoveAllListenersReturnValue);

  //   });
  // });
});
