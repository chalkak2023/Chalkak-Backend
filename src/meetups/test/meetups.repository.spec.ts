import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { MeetupsRepository } from '../meetups.repository';
import { Meetup } from '../entities/meetup.entity';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Join } from '../entities/join.entity';
import { CreateMeetupDTO } from '../dto/create-meetup.dto';

describe('MeetupsRepsitory', () => {
  let repository: MeetupsRepository;
  const mockDataSource = {
    createEntityManager: jest.fn(),
    createQueryRunner: jest.fn()
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
    }).compile();

    repository = module.get(MeetupsRepository);
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
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockReturnValue),
      } as any);

      const page = 1;
      const result = await repository.getMeetups(page);

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
  });

  describe('createMeetup Method', () => {
    const mockMeetupDto: CreateMeetupDTO = {
      userId: 1,
      title: 'title',
      content: 'content',
      place: 'place',
      schedule: '2023-03-02 20:00',
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