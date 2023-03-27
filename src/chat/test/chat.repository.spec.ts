import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { ChatRepository } from '../chat.repository';
import { Meetup } from 'src/meetups/entities/meetup.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Join } from 'src/meetups/entities/join.entity';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

const moduleMocker = new ModuleMocker(global);

describe('MeetupsRepsitory', () => {
  let repository: ChatRepository;
  let mockMeetupRepository: jest.Mocked<Repository<Meetup>>;
  const mockDataSource = {
    createEntityManager: jest.fn(),
    createQueryRunner: jest.fn()
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatRepository,
        {
          provide: DataSource,
          useValue: mockDataSource
        }
      ]
    }).useMocker((token) => {
      if (token === getRepositoryToken(Meetup)) {
        return {
          createQueryBuilder: jest.fn(),
        };
      }
      if (typeof token === 'function') {
        const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
        const Mock = moduleMocker.generateFromMetadata(mockMetadata);
        return new Mock();
      }
    }).compile();

    repository = module.get(ChatRepository);
    mockMeetupRepository = module.get(getRepositoryToken(Meetup));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getChatRooms Method', () => {
    it('Success', async () => {
      const mockReturnValue = [new Meetup()];
      jest.spyOn(mockMeetupRepository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockReturnValue),
      } as any);

      const userId = 1;
      const result = await repository.getChatRooms(userId);

      expect(result).toBe(mockReturnValue);
      expect(mockMeetupRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(mockMeetupRepository.createQueryBuilder).toHaveBeenCalledWith('m');
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('exitChatRoom Method', () => {
    const meetupId = 1;
    const userId = 1;
    it('Fail - 모임에 참여중인 유저가 아님', async () => {
      const mockFindJoinArrResult = [{ userId: 2 }];
      const mockQueryRunner = {
        manager: {
          getRepository: jest.fn().mockImplementation((entity) => {
            if (entity === Join) {
              return {
                find: jest.fn().mockResolvedValue(mockFindJoinArrResult),
              };
            }
          }),
        },
        rollbackTransaction: jest.fn(),
      };
      jest.spyOn(mockDataSource, 'createQueryRunner').mockReturnValue(mockQueryRunner);
      try {
        await repository.exitChatRoom(meetupId, userId);
      } catch (err) {
        expect(mockQueryRunner.manager.getRepository).toHaveBeenCalledWith(Join);
        expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
        expect(err).toBeInstanceOf(BadRequestException);
      }
    });
    it('Success', async () => {
      const mockFindJoinArrResult = [{ userId: 1 }];
      const mockQueryRunner = {
        manager: {
          getRepository: jest.fn().mockImplementation((entity) => {
            if (entity === Join) {
              return {
                find: jest.fn().mockResolvedValue(mockFindJoinArrResult),
                delete: jest.fn().mockResolvedValue(null),
              };
            }
            if (entity === Meetup) {
              return {
                delete: jest.fn().mockResolvedValue(null),
              };
            }
          }),
        },
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
      };
      jest.spyOn(mockDataSource, 'createQueryRunner').mockReturnValue(mockQueryRunner);
      await repository.exitChatRoom(meetupId, userId);

      expect(mockQueryRunner.manager.getRepository).toHaveBeenCalledWith(Join);
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.getRepository).toHaveBeenCalledWith(Meetup);
      expect(mockQueryRunner.manager.getRepository).toHaveBeenCalledTimes(3);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
    it('Fail - getRepository(Join).delete() Error', async () => {
      const mockFindJoinArrResult = [{ userId: 1 }];
      const mockQueryRunner = {
        manager: {
          getRepository: jest.fn().mockImplementation((entity) => {
            if (entity === Join) {
              return {
                find: jest.fn().mockResolvedValue(mockFindJoinArrResult),
                delete: jest.fn().mockImplementation(() => new Error()),
              };
            }
            // if (entity === Meetup) {
            //   return {
            //     delete: jest.fn().mockResolvedValue(null),
            //   };
            // }
          }),
        },
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
      };
      jest.spyOn(mockDataSource, 'createQueryRunner').mockReturnValue(mockQueryRunner);
      try {
        await repository.exitChatRoom(meetupId, userId);
      } catch (err) {
        expect(mockQueryRunner.manager.getRepository).toHaveBeenCalledWith(Join);
        expect(mockQueryRunner.connect).toHaveBeenCalled();
        expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
        // expect(mockQueryRunner.manager.getRepository).toHaveBeenCalledWith(Meetup);
        expect(mockQueryRunner.manager.getRepository).toHaveBeenCalled();
        expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
        expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
        expect(mockQueryRunner.release).toHaveBeenCalled();
        expect(err).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });
});