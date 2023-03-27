import { BadRequestException, NotAcceptableException, NotFoundException, Module } from '@nestjs/common';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { PhotospotService } from './photospot.service';
import { Photospot } from 'src/photospot/entities/photospot.entity';
import { Photo } from './entities/photo.entity';
import { User } from 'src/auth/entities/user.entity';
import { PhotoKeyword } from './entities/photokeyword.entity';
import { Collection } from 'src/collections/entities/collection.entity';
import { CollectionKeyword } from 'src/collections/entities/collection.keyword.entity';
import { S3Service } from './../common/aws/s3.service';
import { GoogleVisionService } from './../googleVision/GoogleVision.service';
import { ConfigService } from '@nestjs/config';
import { CreatePhotospotDto } from './dto/create-photospot.dto';
import { ModifyPhotospotDto } from './dto/modify-photospot.dto';

const moduleMocker = new ModuleMocker(global);
const collectionId = 1;
const photospotId = 1;
const userId = 1;
const photoId = 1;
const files: any[] = ['test-file'];
const imagePath = 'test-image-path';
const mockInsertPhotospotResult = {
  identifiers: [{ id: 1 }],
};
const mockInsertPhotoResult = {
  identifiers: [{ id: 1 }],
};
const mockCollection: Collection = {
  id: 1,
  userId: 1,
  title: '테스트',
  description: '테스트 내용',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  user: new User(),
  photospots: [new Photospot()],
  collection_keywords: [new CollectionKeyword()],
};
const mockPhotospots: Photospot[] = [
  {
    id: 1,
    userId: 1,
    collectionId: 1,
    title: '테스트',
    description: '테스트 내용',
    latitude: 123.123123123,
    longitude: 222.2231231,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    user: new User(),
    collection: new Collection(),
    photos: [new Photo()],
  },
  {
    id: 2,
    userId: 2,
    collectionId: 2,
    title: '테스트',
    description: '테스트 내용',
    latitude: 123.123123123,
    longitude: 222.2231231,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    user: new User(),
    collection: new Collection(),
    photos: [new Photo()],
  },
];
const mockPhoto = {
  id: 1,
  userId: 1,
  photospotId: 1,
  image: 'test-image-path',
  createAt: new Date(),
  user: new User(),
  photospot: new Photospot(),
  photoKeywords: [new PhotoKeyword()],
}

describe('PhotospotService', () => {
  let service: PhotospotService;
  let mockPhotospotRepository: jest.Mocked<Repository<Photospot>>;
  let mockCollectionRepository: jest.Mocked<Repository<Collection>>;
  let mockPhotoRepository: jest.Mocked<Repository<Photo>>;
  let mockPhotoKeywordRepositor: jest.Mocked<Repository<PhotoKeyword>>;
  let mockS3Service: jest.Mocked<S3Service>;
  let mockGoogleService: jest.Mocked<GoogleVisionService>;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockDataSource: jest.Mocked<DataSource>;
  const PHOTOSPOT_REPOSITORY_TOKEN = getRepositoryToken(Photospot);
  const COLLECTION_REPOSITORY_TOKEN = getRepositoryToken(Collection);
  const PHOTO_REPOSITORY_TOKEN = getRepositoryToken(Photo);
  const PHOTOKEYWORD_REPOSITORY_TOKEN = getRepositoryToken(PhotoKeyword);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhotospotService],
    })
      .useMocker((token) => {
        if (token === PHOTOSPOT_REPOSITORY_TOKEN) {
          return {
            insert: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
            softRemove: jest.fn(),
          };
        }
        if (token === COLLECTION_REPOSITORY_TOKEN) {
          return {
            findOne: jest.fn(),
          };
        }
        if (token === PHOTO_REPOSITORY_TOKEN) {
          return {
            findOne: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(),
            save: jest.fn(),
          };
        }
        if (token === PHOTOKEYWORD_REPOSITORY_TOKEN) {
          return {
            save: jest.fn(),
            findOne: jest.fn(),
          };
        }
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    service = module.get(PhotospotService);
    mockPhotospotRepository = module.get(PHOTOSPOT_REPOSITORY_TOKEN);
    mockCollectionRepository = module.get(COLLECTION_REPOSITORY_TOKEN);
    mockPhotoRepository = module.get(PHOTO_REPOSITORY_TOKEN);
    mockPhotoKeywordRepositor = module.get(PHOTOKEYWORD_REPOSITORY_TOKEN);
    mockS3Service = module.get(S3Service);
    mockGoogleService = module.get(GoogleVisionService);
    mockConfigService = module.get(ConfigService);
    mockDataSource = module.get(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Service createPhotospot', () => {
    it('createPhotospot 성공', async () => {
      const dto = new CreatePhotospotDto();
      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          getRepository: jest.fn().mockImplementation((entity) => {
            if (entity === Photospot) {
              return {
                insert: jest.fn().mockResolvedValue(mockInsertPhotospotResult),
              };
            }
            if (entity === Photo) {
              return {
                insert: jest.fn().mockResolvedValue(mockInsertPhotoResult),
              };
            }
          }),
        },
      } as unknown as QueryRunner;

      service.isSafePhoto = jest.fn();
      service.createImageKeyword = jest.fn();
      jest.spyOn(mockS3Service, 'putObject').mockResolvedValue(imagePath);
      jest.spyOn(mockDataSource, 'createQueryRunner').mockReturnValue(mockQueryRunner);
      jest.spyOn(mockCollectionRepository, 'findOne').mockResolvedValue(mockCollection);

      await service.createPhotospot(dto, files, userId, collectionId);
      expect(mockCollectionRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.getRepository).toHaveBeenCalledWith(Photospot);
      expect(mockS3Service.putObject).toHaveBeenCalled();
      expect(mockQueryRunner.manager.getRepository).toHaveBeenCalledWith(Photo);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(service.isSafePhoto).toHaveBeenCalledTimes(1);
    });
  });

  describe('service getAllPhotospot', () => {
    it('getAllPhotospot 성공', async () => {
      jest.spyOn(mockCollectionRepository, 'findOne').mockResolvedValue(mockCollection);
      jest.spyOn(mockPhotospotRepository, 'find').mockResolvedValue(mockPhotospots);

      const returnPhotospots = await service.getAllPhotospot(collectionId);
      expect(mockCollectionRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockPhotospotRepository.find).toHaveBeenCalledTimes(1);
      expect(returnPhotospots).toEqual(mockPhotospots);
    });
  });

  describe('service getPhotospot', () => {
    it('getPhotospot 성공', async () => {
      jest.spyOn(mockPhotospotRepository, 'findOne').mockResolvedValue(mockPhotospots[0]);

      const returnPhtospot = await service.getPhotospot(photospotId);
      expect(mockPhotospotRepository.findOne).toHaveBeenCalledTimes(1);
      expect(returnPhtospot).toEqual(mockPhotospots[0]);
    });
  });

  describe('service modifyPhotospot', () => {
    it('modifyPhotospot 성공', async () => {
      const dto = new ModifyPhotospotDto();
      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          getRepository: jest.fn().mockImplementation((entity) => {
            if (entity === Photospot) {
              return {
                update: jest.fn(),
              };
            }
            if (entity === Photo) {
              return {
                insert: jest.fn().mockResolvedValue(mockInsertPhotoResult),
                delete: jest.fn(),
              };
            }
          }),
        },
      } as unknown as QueryRunner;
      service.getPhotospot = jest.fn(async () => mockPhotospots[0]);
      service.createImageKeyword = jest.fn();
      service.isSafePhoto = jest.fn();
      jest.spyOn(mockS3Service, 'putObject').mockResolvedValue(imagePath);
      jest.spyOn(mockDataSource, 'createQueryRunner').mockReturnValue(mockQueryRunner);

      await service.modifyPhotospot(dto, files, userId, photospotId);
      expect(service.getPhotospot).toHaveBeenCalledTimes(1);
      expect(await service.getPhotospot(photospotId)).toEqual(mockPhotospots[0]);
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.getRepository).toHaveBeenCalledWith(Photospot);
      expect(mockS3Service.putObject).toHaveBeenCalled();
      expect(mockQueryRunner.manager.getRepository).toHaveBeenCalledWith(Photo);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('service deletePhotospot', () => {
    it('deletePhotospot 성공', async () => {
      service.getPhotospot = jest.fn(async () => mockPhotospots[0]);

      await service.deletePhotospot(photospotId, userId);
      expect(mockPhotospotRepository.softRemove).toHaveBeenCalledTimes(1);
      expect(mockPhotospotRepository.softRemove).toHaveBeenCalledWith(mockPhotospots[0]);
      expect(mockPhotoRepository.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('service getRandomPhoto', () => {
    it('getRandomPhoto 성공', async () => {
      const photos = [
        {
          id: 1,
          image: 'photo1.jpg',
          photospot: {
            id: 1,
            collection: {
              id: 1,
            },
          },
        },
        {
          id: 2,
          image: 'photo2.jpg',
          photospot: {
            id: 2,
            collection: {
              id: 2,
            },
          },
        },
      ];

      jest.spyOn(mockPhotoRepository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(photos),
      } as any);

      const randomPhoto = await service.getRandomPhoto();
      expect(mockPhotoRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(randomPhoto).toEqual(photos);
    });
  });

  describe('service createImageKeyword', () => {
    it('createImageKeyword 성공', async () => {
      const photoKeywords = ['test1', 'test2', 'test3'];
      const preKeyword = { id: 1, keyword: 'test1', photos: [mockPhoto] };
      const insertKeyword = { id: 2, keyword: 'test4', photos: [mockPhoto] };
      
      jest.spyOn(mockGoogleService, 'imageLabeling').mockResolvedValue(photoKeywords);
      jest.spyOn(mockPhotoKeywordRepositor, 'findOne').mockResolvedValue(preKeyword);
      jest.spyOn(mockPhotoKeywordRepositor, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(mockPhotoKeywordRepositor, 'save').mockResolvedValue(insertKeyword);
      jest.spyOn(mockPhotoRepository, 'findOne').mockResolvedValue(mockPhoto);

      await service.createImageKeyword(imagePath, photoId);

      expect(mockGoogleService.imageLabeling).toHaveBeenCalledTimes(1);
      expect(mockGoogleService.imageLabeling).toHaveBeenCalledWith(imagePath);
      expect(await mockGoogleService.imageLabeling(imagePath)).toEqual(photoKeywords);
      expect(mockPhotoKeywordRepositor.findOne).toHaveBeenCalledTimes(3);
      expect(mockPhotoKeywordRepositor.save).toHaveBeenCalledTimes(1);
      expect(mockPhotoRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockPhotoRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('service getRecommendPhoto', () => {
    it('getRecommendPhoto 성공', async () => {
      jest.spyOn(mockPhotoRepository, 'findOne').mockResolvedValue(mockPhoto);
      jest.spyOn(mockPhotoRepository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockPhoto]),
      } as any);

      const recommendPhoto = await service.getRecommendPhoto(photoId);
      expect(mockPhotoRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockPhotoRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(recommendPhoto).toEqual([mockPhoto])
    })
  })

  describe('service getAllPhoto', () => {
    it('getAllPhoto 성공', async () => {
      const take = 18;
      const page = 1;
      jest.spyOn(mockConfigService, 'get').mockReturnValue(take);
      jest.spyOn(mockPhotoRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockPhoto]),
      } as any);

      const returnPhoto = await service.getAllPhoto(page);
      expect(mockConfigService.get).toHaveBeenCalledTimes(1);
      expect(mockPhotoRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(returnPhoto).toEqual([mockPhoto]);
    })
  })

  describe('service isSafePhoto', () => {
    it('isSafePhoto 사진 문제없음 성공', async () => {
      const isSafe = true

      service.getPhotospot = jest.fn( async () => mockPhotospots[0]);
      jest.spyOn(mockGoogleService, 'imageSafeGuard').mockResolvedValue(isSafe);

      await service.isSafePhoto(photospotId);
      expect(service.getPhotospot).toHaveBeenCalledTimes(1)
      expect(service.getPhotospot).toHaveBeenCalledWith(photospotId)
      expect(mockGoogleService.imageSafeGuard).toHaveBeenCalled();
      expect(mockPhotospotRepository.softRemove).not.toHaveBeenCalled();
      expect(mockPhotoRepository.delete).not.toHaveBeenCalled();
    }) 
  })
});
