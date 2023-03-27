import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { MeetupsRepository } from '../meetups.repository';
import { Meetup } from '../entities/meetup.entity';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Join } from '../entities/join.entity';
import { CreateMeetupDTO } from '../dto/create-meetup.dto';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';

const moduleMocker = new ModuleMocker(global);

describe('MeetupsRepsitory', () => {
  let repository: MeetupsRepository;
  let mockJoinRepository: jest.Mocked<Repository<Join>>;
  const mockDataSource = {
    createEntityManager: jest.fn(),
    createQueryRunner: jest.fn()
  };
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockConfig: { MEETUPS_PAGE_LIMIT: number | null } = {
    MEETUPS_PAGE_LIMIT: 9
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetupsRepository,
        {
          provide: DataSource,
          useValue: mockDataSource
        }
      ]
    }).useMocker((token) => {
      if (token === getRepositoryToken(Join)) {
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

    repository = module.get(MeetupsRepository);
    mockJoinRepository = module.get(getRepositoryToken(Join));
    mockConfigService = module.get(ConfigService);
    mockConfigService.get.mockImplementation((key: keyof typeof mockConfig) => mockConfig[key]);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getMeetups Method', () => {
    it('Success', async () => {
      const mockReturnValue = [new Meetup()];
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockReturnValue),
      } as any);

      const page = 1;
      const keyword = 'keyword';
      const result = await repository.getMeetups(page, keyword);

      expect(result).toBe(mockReturnValue);
      expect(repository.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('m');
      // expect(repository.createQueryBuilder().select()).toHaveBeenCalledTimes(1);
      // expect(repository.createQueryBuilder().select()).toHaveBeenCalledWith([
      //   'm.id',
      //   'm.userId',
      //   'u.email',
      //   'm.title',
      //   'm.content',
      //   'm.place',
      //   'm.schedule',
      //   'm.headcount',
      //   'm.createdAt',
      //   'j',
      // ]);
      expect(result).toBeInstanceOf(Array);
    });

    // it('Success - when configService get MEETUPS_PAGE_LIMIT is null ', async () => {
    //   mockConfig.MEETUPS_PAGE_LIMIT = null;
    //   const mockReturnValue = [new Meetup()];
    //   jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
    //     select: jest.fn().mockReturnThis(),
    //     leftJoin: jest.fn().mockReturnThis(),
    //     where: jest.fn().mockReturnThis(),
    //     orderBy: jest.fn().mockReturnThis(),
    //     take: jest.fn().mockReturnThis(),
    //     skip: jest.fn().mockReturnThis(),
    //     getMany: jest.fn().mockResolvedValue(mockReturnValue),
    //   } as any);

    //   const page = 1;
    //   const keyword = 'keyword';
    //   const result = await repository.getMeetups(page, keyword);

    //   expect(result).toBe(mockReturnValue);
    //   expect(repository.createQueryBuilder).toHaveBeenCalledTimes(1);
    //   expect(repository.createQueryBuilder).toHaveBeenCalledWith('m');
    //   // expect(repository.createQueryBuilder().select()).toHaveBeenCalledTimes(1);
    //   // expect(repository.createQueryBuilder().select()).toHaveBeenCalledWith([
    //   //   'm.id',
    //   //   'm.userId',
    //   //   'u.email',
    //   //   'm.title',
    //   //   'm.content',
    //   //   'm.place',
    //   //   'm.schedule',
    //   //   'm.headcount',
    //   //   'm.createdAt',
    //   //   'j',
    //   // ]);
    //   expect(result).toBeInstanceOf(Array);
    // });
  });

  describe('getMeetupsWithJoined Method', () => {mockJoinRepository
    it('Success', async () => {
      const mockJoinCreateQueryBuilderReturnValue = [{ meetupId: 1 }];
      const mockMeetupCreateQueryBuilderReturnValue = [new Meetup()];
      jest.spyOn(mockJoinRepository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockJoinCreateQueryBuilderReturnValue),
      } as any);

      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        whereInIds: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockMeetupCreateQueryBuilderReturnValue),
      } as any);

      const userId = 1;
      const page = 1;
      const keyword = 'keyword';
      const result = await repository.getMeetupsWithJoined(userId, page, keyword);

      expect(result).toBe(mockMeetupCreateQueryBuilderReturnValue);
      expect(mockJoinRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(mockJoinRepository.createQueryBuilder).toHaveBeenCalledWith('j');
      expect(repository.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('m');
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('getMeetupsWithMine Method', () => {mockJoinRepository
    it('Success', async () => {
      const mockMeetupCreateQueryBuilderReturnValue = [new Meetup()];
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockMeetupCreateQueryBuilderReturnValue),
      } as any);

      const userId = 1;
      const page = 1;
      const keyword = 'keyword';
      const result = await repository.getMeetupsWithMine(userId, page, keyword);

      expect(result).toBe(mockMeetupCreateQueryBuilderReturnValue);
      expect(repository.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('m');
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('createMeetup Method', () => {
    const mockMeetupDto: CreateMeetupDTO = {
      userId: 1,
      title: 'title',
      content: 'content',
      place: 'place',
      schedule: new Date('2023-03-02 20:00'),
      headcount: 5,
    };
    const mockInsertMeetupResult = {
      raw: { insertId: 1 }
    };
    it('Success', async () => {
      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        manager: {
          getRepository: jest.fn().mockImplementation((entity) => {
            if (entity === Meetup) {
              return {
                insert: jest.fn().mockResolvedValue(mockInsertMeetupResult),
              };
            }
            if (entity === Join) {
              return {
                insert: jest.fn().mockResolvedValue(null),
              };
            }
          }),
        },
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
      };
      jest.spyOn(mockDataSource, 'createQueryRunner').mockReturnValue(mockQueryRunner);
      await repository.createMeetup(mockMeetupDto);

      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.getRepository).toHaveBeenCalledWith(Meetup);
      // expect(mockQueryRunner.manager.getRepository(Meetup).insert).toHaveBeenCalledWith(mockMeetupDto);
      expect(mockQueryRunner.manager.getRepository).toHaveBeenCalledWith(Join);
      // expect(mockQueryRunner.manager.getRepository(Join).insert).toHaveBeenCalledWith({
      //   userId: mockMeetupDto.userId,
      //   meetupId: mockInsertMeetupResult.raw.insertId,
      // });
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
    it('Fail - DB error', async () => {
      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        manager: {
          getRepository: jest.fn().mockImplementation((entity) => {
            if (entity === Meetup) {
              return {
                insert: jest.fn().mockImplementation(() => {
                  throw new Error();
                }),
              };
            }
          }),
        },
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
      };
      jest.spyOn(mockDataSource, 'createQueryRunner').mockReturnValue(mockQueryRunner);
      try {
        await repository.createMeetup(mockMeetupDto);
      } catch (err) {
        expect(mockQueryRunner.connect).toHaveBeenCalled();
        expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
        expect(mockQueryRunner.manager.getRepository).toHaveBeenCalledWith(Meetup);
        expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
        expect(err).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });

  describe('getMeetup Method', () => {
    it('Success', async () => {
      const mockReturnValue = new Meetup();
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockReturnValue),
      } as any);

      const meetupId = 1;
      const result = await repository.getMeetup(meetupId);

      expect(result).toBe(mockReturnValue);
      expect(repository.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('m');
      expect(result).toBeInstanceOf(Object);
    });
    it('Fail - meetup is null', async () => {
      const mockReturnValue = null;
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockReturnValue),
      } as any);

      const meetupId = 1;
      try {
        await repository.getMeetup(meetupId);
      } catch (err) {
        expect(repository.createQueryBuilder).toHaveBeenCalledTimes(1);
        expect(repository.createQueryBuilder).toHaveBeenCalledWith('m');
        expect(err).toBeInstanceOf(NotFoundException);
      }
    });
  });
});