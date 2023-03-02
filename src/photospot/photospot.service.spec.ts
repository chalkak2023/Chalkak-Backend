import { FileSystemStoredFile } from 'nestjs-form-data/dist/classes/storage';
import { ModifyPhotospotDto } from './dto/modify-photospot.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { PhotospotService } from './photospot.service';
import { Photospot } from 'src/photospot/entities/photospot.entity';
import { S3Service } from './../common/aws/s3.service';
import { TypeOrmConfigService } from './../common/config/typeorm.config.service';
import { CreatePhotospotDto } from './dto/create-photospot.dto';

const moduleMocker = new ModuleMocker(global);

describe('PhotospotService', () => {
  let service: PhotospotService;
  let mockPhotospotRepository: jest.Mocked<Repository<Photospot>>;
  let mockS3Service: jest.Mocked<S3Service>;
  const REPOSITORY_TOKEN = getRepositoryToken(Photospot);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhotospotService],
    })
      .useMocker((token) => {
        if (token === REPOSITORY_TOKEN) {
          return {
            insert: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
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
    mockPhotospotRepository = module.get(REPOSITORY_TOKEN);
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
    });

    it('createPhotospot 성공', async () => {
      const dto = new CreatePhotospotDto();
      const userId = 1;
      const collectionId = 1;
      const { title, description, latitude, longitude, image } = dto;
      const imagePath = 'AWS path';

      mockS3Service.putObject.mockResolvedValue(imagePath);
      await service.createPhotospot(dto, userId, collectionId);
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

      mockPhotospotRepository.find.mockResolvedValue(photospots);
      expect(service.getAllPhotospot(collectionId)).resolves.toStrictEqual(photospots);
    });

    it('getAllPhotospot 해당 값 못 찾을 경우', async () => {
      const collectionId = 1;

      mockPhotospotRepository.find.mockResolvedValue([]);
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
    it('should db defined', () => {
      expect(service.modifyPhotospot).toBeDefined();
    });
    it('modifyPhotospot image가 있을 때 성공', async () => {
      const dto = { title: '테스트', description: '테스트 설명', image: {} as FileSystemStoredFile };
      const photospotId = 1;
      const photospot = new Photospot();
      const imagePath = 'AWS path';

      mockPhotospotRepository.findOne.mockResolvedValue(photospot);
      mockS3Service.putObject.mockResolvedValue(imagePath);

      await service.modifyPhotospot(dto, photospotId);
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
      const photospot = new Photospot();

      mockPhotospotRepository.findOne.mockResolvedValue(photospot);
      await service.modifyPhotospot(dto, photospotId);
      expect(mockS3Service.putObject).toHaveBeenCalledTimes(0);
      expect(mockPhotospotRepository.update).toHaveBeenCalledTimes(1);
      expect(mockPhotospotRepository.update).toHaveBeenCalledWith({ id: photospotId }, dto);
    });

    it('modifyPhotospot 해당 값 없을 때 실패', async () => {
      const dto = { title: '테스트', description: '테스트 설명', image: {} as FileSystemStoredFile };
      const photospotId = 1;

      mockPhotospotRepository.findOne.mockResolvedValue(null);
      expect(service.modifyPhotospot(dto, photospotId)).rejects.toThrowError(new NotFoundException('해당 포토스팟을 찾을 수 없습니다.'));
    })
  });

  
  describe('Service deletePhotospot', () => {
    it('should db defined', () => {
      expect(service.deletePhotospot).toBeDefined();
    });
    it('deletePhotospot 성공', async () => {
      const photospotId = 1;
      const photospot = new Photospot();
 
      mockPhotospotRepository.findOne.mockResolvedValue(photospot);

      await service.deletePhotospot(photospotId);
      expect(mockPhotospotRepository.softDelete).toHaveBeenCalledTimes(1);
      expect(mockPhotospotRepository.softDelete).toHaveBeenCalledWith(photospotId);
    });

    it('deletePhotospot 해당 값 못 찾을 경우', async () => {
      const photospotId = 1;

      mockPhotospotRepository.findOne.mockResolvedValue(null);
      expect(service.deletePhotospot(photospotId)).rejects.toThrowError(new NotFoundException('해당 포토스팟을 찾을 수 없습니다.'));
    });
  });
});
