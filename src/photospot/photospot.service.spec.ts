import { BadRequestException, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { PhotospotService } from './photospot.service';
import { Photospot } from 'src/photospot/entities/photospot.entity';
import { Photo } from './entities/photo.entity';
import { User } from 'src/auth/entities/user.entity';
import { Collection } from 'src/collections/entities/collection.entity';
import { CollectionKeyword } from 'src/collections/entities/collection.keyword.entity';
import { S3Service } from './../common/aws/s3.service';
import { CreatePhotospotDto } from './dto/create-photospot.dto';
import { ModifyPhotospotDto } from './dto/modify-photospot.dto';

const moduleMocker = new ModuleMocker(global);

describe('PhotospotService', () => {
  let service: PhotospotService;
  let mockPhotospotRepository: jest.Mocked<Repository<Photospot>>;
  let mockCollectionRepository: jest.Mocked<Repository<Collection>>;
  let mockPhotoRepository: jest.Mocked<Repository<Photo>>;
  let mockS3Service: jest.Mocked<S3Service>;
  let mockDataSource: jest.Mocked<DataSource>;
  const PHOTOSPOT_REPOSITORY_TOKEN = getRepositoryToken(Photospot);
  const COLLECTION_REPOSITORY_TOKEN = getRepositoryToken(Collection);
  const PHOTO_REPOSITORY_TOKEN = getRepositoryToken(Photo);

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
            softDelete: jest.fn(),
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
    mockS3Service = module.get(S3Service);
    mockDataSource = module.get(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Service createPhotospot', () => {
    it('should be defined', () => {
      expect(service.getAllPhotospot).toBeDefined();
      expect(mockS3Service.putObject).toBeDefined();
      expect(mockPhotospotRepository.insert).toBeDefined();
      expect(mockCollectionRepository.findOne).toBeDefined();
    });

    it('createPhotospot ??????', async () => {
      const dto = new CreatePhotospotDto();
      const userId = 1;
      const collectionId = 1;
      // const { title, description, latitude, longitude } = dto;
      const files = [{}] as Express.Multer.File[];
      const imagePath = 'AWS path';
      const collection = {
        id: 1,
        userId: 1,
        title: '?????????',
        description: '????????? ??????',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        user: {} as User,
        photospots: [{}] as Photospot[],
        collection_keywords: [{}] as CollectionKeyword[],
      };
      const mockInsertPhotospotResult = {
        identifiers: [{ id: 1 }],
      };
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
                insert: jest.fn().mockResolvedValue(null),
              };
            }
          }),
        },
      } as unknown as QueryRunner;

      mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner);
      mockCollectionRepository.findOne.mockResolvedValue(collection);
      mockS3Service.putObject.mockResolvedValue(imagePath);

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
    });

    // TO DO ????????? ?????? ????????? ?????? ????????? ??????
    // it('createPhotospot ??????', async () => {
    //   const dto = new CreatePhotospotDto();
    //   const userId = 1;
    //   const collectionId = 1;
    //   const collection = {
    //     id: 1,
    //     userId: 1,
    //     title: '?????????',
    //     description: '????????? ??????',
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //     deletedAt: null,
    //     user: {} as User,
    //     photospots: [{}] as Photospot[],
    //     collection_keywords: [{}] as CollectionKeyword[],
    //   };
    //   const { title, description, latitude, longitude } = dto;
    //   const files = [{}] as Express.Multer.File[];
    //   const imagePath = 'AWS path';

    //   const mockQueryRunner = {
    //     connect: jest.fn(),
    //     startTransaction: jest.fn(),
    //     commitTransaction: jest.fn(),
    //     rollbackTransaction: jest.fn(),
    //     release: jest.fn(),
    //     manager: {
    //       getRepository: jest.fn().mockImplementation((entity) => {
    //         if (entity === Photospot) {
    //           return {
    //             insert: jest.fn().mockResolvedValue(new Error('?????????')),
    //           };
    //         }
    //         if (entity === Photo) {
    //           return {
    //             insert: jest.fn().mockResolvedValue(null),
    //           };
    //         }
    //       }),
    //     },
    //   } as unknown as QueryRunner;

    //   mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner);
    //   mockCollectionRepository.findOne.mockResolvedValue(collection);
    //   mockS3Service.putObject.mockResolvedValue(imagePath);

    //   await service.createPhotospot(dto, files, userId, collectionId);
    //   expect(mockCollectionRepository.findOne).toHaveBeenCalledTimes(1);
    //   expect(mockQueryRunner.connect).toHaveBeenCalled();
    //   expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
    //   expect(mockQueryRunner.manager.getRepository).toHaveBeenCalledWith(Photospot);
    //   expect(
    //     mockQueryRunner.manager.getRepository(Photo).insert({ title, description, latitude, longitude, userId, collectionId })
    //   ).rejects.toThrow(new BadRequestException('????????? ???????????? ????????????.'));
    //   expect(mockS3Service.putObject).not.toHaveBeenCalled();
    //   expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
    //   expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    //   expect(mockQueryRunner.release).toHaveBeenCalled();

    //   mockCollectionRepository.findOne.mockResolvedValue(collection)
    //   mockPhotospotRepository.insert.mockRejectedValue(new Error());
    //   expect(service.createPhotospot(dto, files, userId, collectionId)).rejects.toThrowError(
    //     new BadRequestException('????????? ???????????? ????????????.')
    //   );
    // });
  });

  describe('Service getAllPhotospot', () => {
    it('should db defined', () => {
      expect(service.getAllPhotospot).toBeDefined();
    });

    it('getAllPhotospot ??????', async () => {
      const collectionId = 1;
      const photospots = [new Photospot()];
      const collection = {
        id: 1,
        userId: 1,
        title: '?????????',
        description: '????????? ??????',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        user: {} as User,
        photospots: [{}] as Photospot[],
        collection_keywords: [{}] as CollectionKeyword[],
      };

      mockCollectionRepository.findOne.mockResolvedValue(collection);
      mockPhotospotRepository.find.mockResolvedValue(photospots);
      expect(service.getAllPhotospot(collectionId)).resolves.toStrictEqual(photospots);
    });

    it('getAllPhotospot ?????? ??? ??? ?????? ??????', async () => {
      const collectionId = 1;
      const collection = null;

      mockCollectionRepository.findOne.mockResolvedValue(collection);
      expect(service.getAllPhotospot(collectionId)).rejects.toThrowError(
        new NotFoundException('?????? ???????????? ?????? ??? ????????????.')
      );
    });
  });

  describe('Service getPhotospot', () => {
    it('should db defined', () => {
      expect(service.getPhotospot).toBeDefined();
    });
    it('getPhotospot ??????', async () => {
      const photospotId = 1;
      const photospot = new Photospot();

      mockPhotospotRepository.findOne.mockResolvedValue(photospot);
      expect(service.getPhotospot(photospotId)).resolves.toStrictEqual(photospot);
    });

    it('getPhotospot ?????? ??? ??? ?????? ??????', async () => {
      const photospotId = 1;

      mockPhotospotRepository.findOne.mockResolvedValue(null);
      expect(service.getPhotospot(photospotId)).rejects.toThrowError(new NotFoundException('?????? ??????????????? ?????? ??? ????????????.'));
    });
  });

  describe('Service modifyPhotospot', () => {
    const photospot = {
      id: 1,
      userId: 1,
      collectionId: 1,
      title: '?????????',
      description: '??????????????????',
      latitude: 33.3333,
      longitude: 111.11111,
      photos: [new Photo()],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      user: new User(),
      collection: new Collection(),
    };

    it('should db defined', () => {
      expect(service.modifyPhotospot).toBeDefined();
    });

    it('modifyPhotospot image??? ?????? ??? ??????', async () => {
      const dto = { title: '?????????', description: '????????? ??????' };
      const photospotId = 1;
      const files = [{}] as Express.Multer.File[];
      const imagePath = 'AWS path';
      const userId = 1;

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
                insert: jest.fn().mockResolvedValue(null),
              };
            }
          }),
        },
      } as unknown as QueryRunner;

      mockPhotospotRepository.findOne.mockResolvedValue(photospot);
      mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner);
      mockS3Service.putObject.mockResolvedValue(imagePath);

      await service.modifyPhotospot(dto, files, photospotId, userId);
      expect(mockPhotospotRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.getRepository).toHaveBeenCalledWith(Photospot);
      expect(mockS3Service.putObject).toHaveBeenCalled();
      expect(mockQueryRunner.manager.getRepository).toHaveBeenCalledWith(Photo);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      mockS3Service.putObject.mockResolvedValue(imagePath);
    });

    // TO DO ???????????? ?????? ?????? ????????? ?????? ????????? ??????
    //   it('modifyPhotospot image??? ?????? ??? ??????', async () => {
    //     const dto = new ModifyPhotospotDto();
    //     const photospotId = 1;
    //     const userId = 1;

    //     mockPhotospotRepository.findOne.mockResolvedValue(photospot);
    //     await service.modifyPhotospot(dto, photospotId,userId);
    //     expect(mockS3Service.putObject).toHaveBeenCalledTimes(0);
    //     expect(mockPhotospotRepository.update).toHaveBeenCalledTimes(1);
    //     expect(mockPhotospotRepository.update).toHaveBeenCalledWith({ id: photospotId }, dto);
    //   });

    //   it('modifyPhotospot ?????? ??? ?????? ??? ??????', async () => {
    //     const dto = { title: '?????????', description: '????????? ??????', image: {} as FileSystemStoredFile };
    //     const photospotId = 1;
    //     const userId = 1;

    //     mockPhotospotRepository.findOne.mockResolvedValue(null);
    //     expect(service.modifyPhotospot(dto, photospotId,userId)).rejects.toThrowError(new NotFoundException('?????? ??????????????? ?????? ??? ????????????.'));
    //   })

    //   it('modifyPhotospot ????????? ?????? ?????? ??????', async () => {
    //     const dto = new ModifyPhotospotDto();
    //     const photospotId = 1;
    //     const userId = 2;

    //     mockPhotospotRepository.findOne.mockResolvedValue(photospot);
    //     expect(service.modifyPhotospot(dto, photospotId,userId)).rejects.toThrowError(new NotAcceptableException('?????? ??????????????? ?????? ??? ??? ????????????'));
    //   })
    // });

    describe('Service deletePhotospot', () => {
      const photospot = {
        id: 1,
        userId: 1,
        collectionId: 1,
        title: '?????????',
        description: '??????????????????',
        latitude: 33.3333,
        longitude: 111.11111,
        photos: [new Photo()],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        user: new User(),
        collection: new Collection(),
      };

      it('should db defined', () => {
        expect(service.deletePhotospot).toBeDefined();
      });
      it('deletePhotospot ??????', async () => {
        const photospotId = 1;
        const userId = 1;

        mockPhotospotRepository.findOne.mockResolvedValue(photospot);

        await service.deletePhotospot(photospotId, userId);
        expect(mockPhotospotRepository.softDelete).toHaveBeenCalledTimes(1);
        expect(mockPhotospotRepository.softDelete).toHaveBeenCalledWith(photospotId);
      });

      it('deletePhotospot ?????? ??? ??? ?????? ??????', async () => {
        const photospotId = 1;
        const userId = 1;

        mockPhotospotRepository.findOne.mockResolvedValue(null);
        expect(service.deletePhotospot(photospotId, userId)).rejects.toThrowError(
          new NotFoundException('?????? ??????????????? ?????? ??? ????????????.')
        );
      });

      it('deletePhotospot ????????? ?????? ??????', async () => {
        const photospotId = 1;
        const userId = 2;

        mockPhotospotRepository.findOne.mockResolvedValue(photospot);
        expect(service.deletePhotospot(photospotId, userId)).rejects.toThrowError(
          new NotAcceptableException('?????? ??????????????? ?????? ??? ??? ????????????')
        );
      });
    });
  });
});
