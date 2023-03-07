import { FileSystemStoredFile } from 'nestjs-form-data/dist/classes/storage';
import { BadRequestException, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { PhotospotService } from './photospot.service';
import { Photospot } from 'src/photospot/entities/photospot.entity';
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
  let mockS3Service: jest.Mocked<S3Service>;
  const PHOTOSPOT_REPOSITORY_TOKEN = getRepositoryToken(Photospot);
  const COLLECTION_REPOSITORY_TOKEN = getRepositoryToken(Collection);

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
    mockS3Service = module.get(S3Service);
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

    it('createPhotospot 성공', async () => {
      const dto = new CreatePhotospotDto();
      const userId = 1;
      const collectionId = 1;
      const { title, description, latitude, longitude, image } = dto;
      const imagePath = 'AWS path';
      const collection = {id: 1, userId: 1, title: '테스트', description: "테스트 내용", createdAt: new Date(), updatedAt: new Date(),deletedAt: null, user: {} as User, photospots: [{}] as Photospot[], collection_keywords: [{}] as CollectionKeyword[]}

      mockCollectionRepository.findOne.mockResolvedValue(collection)
      mockS3Service.putObject.mockResolvedValue(imagePath);
      await service.createPhotospot(dto, userId, collectionId);
      expect(mockCollectionRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockS3Service.putObject).toHaveBeenCalledTimes(1);
      expect(mockS3Service.putObject).toHaveBeenCalledWith(image);
      expect(mockPhotospotRepository.insert).toHaveBeenCalledTimes(1);
      expect(mockPhotospotRepository.insert).toHaveBeenCalledWith({
        title,
        description,
        latitude,
        longitude,
        imagePath,
        userId,
        collectionId,
      });
    });

    it('createPhotospot 실패', async () => {
      const dto = new CreatePhotospotDto();
      const userId = 1;
      const collectionId = 1;
      const collection = {id: 1, userId: 1, title: '테스트', description: "테스트 내용", createdAt: new Date(), updatedAt: new Date(),deletedAt: null, user: {} as User, photospots: [{}] as Photospot[], collection_keywords: [{}] as CollectionKeyword[]}

      mockCollectionRepository.findOne.mockResolvedValue(collection)
      mockPhotospotRepository.insert.mockRejectedValue(new Error());
      expect(service.createPhotospot(dto, userId, collectionId)).rejects.toThrowError(
        new BadRequestException('요청이 올바르지 않습니다.')
      );
    });
  });

  describe('Service getAllPhotospot', () => {
    it('should db defined', () => {
      expect(service.getAllPhotospot).toBeDefined();
    });

    it('getAllPhotospot 성공', async () => {
      const collectionId = 1;
      const photospots = [new Photospot()];
      const collection = {id: 1, userId: 1, title: '테스트', description: "테스트 내용", createdAt: new Date(), updatedAt: new Date(),deletedAt: null, user: {} as User, photospots: [{}] as Photospot[], collection_keywords: [{}] as CollectionKeyword[]}


      mockCollectionRepository.findOne.mockResolvedValue(collection);
      mockPhotospotRepository.find.mockResolvedValue(photospots);
      expect(service.getAllPhotospot(collectionId)).resolves.toStrictEqual(photospots);
    });

    it('getAllPhotospot 해당 값 못 찾을 경우', async () => {
      const collectionId = 1;
      const collection = null

      mockCollectionRepository.findOne.mockResolvedValue(collection);
      expect(service.getAllPhotospot(collectionId)).rejects.toThrowError(
        new NotFoundException('해당 콜렉션을 찾을 수 없습니다.')
      );
    });
  });

  describe('Service getPhotospot', () => {
    it('should db defined', () => {
      expect(service.getPhotospot).toBeDefined();
    });
    it('getPhotospot 성공', async () => {
      const photospotId = 1;
      const photospot = new Photospot();

      mockPhotospotRepository.findOne.mockResolvedValue(photospot);
      expect(service.getPhotospot(photospotId)).resolves.toStrictEqual(photospot);
    });

    it('getPhotospot 해당 값 못 찾을 경우', async () => {
      const photospotId = 1;

      mockPhotospotRepository.findOne.mockResolvedValue(null);
      expect(service.getPhotospot(photospotId)).rejects.toThrowError(new NotFoundException('해당 포토스팟을 찾을 수 없습니다.'));
    });
  });

  describe('Service modifyPhotospot', () => {
    const photospot = {id: 1, userId: 1, collectionId: 1, title: '테스트', description: '테스트입니다', latitude: 33.3333, longitude: 111.11111, imagePath: 'aws.bucket.image-path', createdAt: new Date(), updatedAt: new Date(), deletedAt: null, user: new User, collection: new Collection};
    
    it('should db defined', () => {
      expect(service.modifyPhotospot).toBeDefined();
    });

    it('modifyPhotospot image가 있을 때 성공', async () => {
      const dto = { title: '테스트', description: '테스트 설명', image: {} as FileSystemStoredFile };
      const photospotId = 1;
      const imagePath = 'AWS path';
      const userId = 1;

      mockPhotospotRepository.findOne.mockResolvedValue(photospot);
      mockS3Service.putObject.mockResolvedValue(imagePath);

      await service.modifyPhotospot(dto, photospotId,userId);
      expect(mockS3Service.putObject).toHaveBeenCalledTimes(1);
      expect(mockS3Service.putObject).toHaveBeenCalledWith(dto.image);
      expect(mockPhotospotRepository.update).toHaveBeenCalledTimes(1);
      expect(mockPhotospotRepository.update).toHaveBeenCalledWith(
        { id: photospotId },
        { title: dto.title, description: dto.description, imagePath }
      );
    });

    it('modifyPhotospot image가 없을 때 성공', async () => {
      const dto = new ModifyPhotospotDto();
      const photospotId = 1;
      const userId = 1;

      mockPhotospotRepository.findOne.mockResolvedValue(photospot);
      await service.modifyPhotospot(dto, photospotId,userId);
      expect(mockS3Service.putObject).toHaveBeenCalledTimes(0);
      expect(mockPhotospotRepository.update).toHaveBeenCalledTimes(1);
      expect(mockPhotospotRepository.update).toHaveBeenCalledWith({ id: photospotId }, dto);
    });

    it('modifyPhotospot 해당 값 없을 때 실패', async () => {
      const dto = { title: '테스트', description: '테스트 설명', image: {} as FileSystemStoredFile };
      const photospotId = 1;
      const userId = 1;

      mockPhotospotRepository.findOne.mockResolvedValue(null);
      expect(service.modifyPhotospot(dto, photospotId,userId)).rejects.toThrowError(new NotFoundException('해당 포토스팟을 찾을 수 없습니다.'));
    })

    it('modifyPhotospot 권한이 없는 수정 실패', async () => {
      const dto = new ModifyPhotospotDto();
      const photospotId = 1;
      const userId = 2;

      mockPhotospotRepository.findOne.mockResolvedValue(photospot);
      expect(service.modifyPhotospot(dto, photospotId,userId)).rejects.toThrowError(new NotAcceptableException('해당 포토스팟에 접근 할 수 없습니다'));
    })
    
  });

  
  describe('Service deletePhotospot', () => {
    const photospot = {id: 1, userId: 1, collectionId: 1, title: '테스트', description: '테스트입니다', latitude: 33.3333, longitude: 111.11111, imagePath: 'aws.bucket.image-path', createdAt: new Date(), updatedAt: new Date(), deletedAt: null, user: new User, collection: new Collection};

    it('should db defined', () => {
      expect(service.deletePhotospot).toBeDefined();
    });
    it('deletePhotospot 성공', async () => {
      const photospotId = 1;
      const userId = 1
 
      mockPhotospotRepository.findOne.mockResolvedValue(photospot);

      await service.deletePhotospot(photospotId, userId);
      expect(mockPhotospotRepository.softDelete).toHaveBeenCalledTimes(1);
      expect(mockPhotospotRepository.softDelete).toHaveBeenCalledWith(photospotId);
    });

    it('deletePhotospot 해당 값 못 찾을 경우', async () => {
      const photospotId = 1;
      const userId = 1

      mockPhotospotRepository.findOne.mockResolvedValue(null);
      expect(service.deletePhotospot(photospotId, userId)).rejects.toThrowError(new NotFoundException('해당 포토스팟을 찾을 수 없습니다.'));
    });

    it('deletePhotospot 권한이 없는 실패', async () => {
      const photospotId = 1;
      const userId = 2

      mockPhotospotRepository.findOne.mockResolvedValue(photospot);
      expect(service.deletePhotospot(photospotId, userId)).rejects.toThrowError(new NotAcceptableException('해당 포토스팟에 접근 할 수 없습니다'));
    })
  });
});
