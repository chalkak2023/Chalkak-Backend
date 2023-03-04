import { ModifyPhotospotDto } from './dto/modify-photospot.dto';
import { CreatePhotospotDto } from './dto/create-photospot.dto';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { Test, TestingModule } from '@nestjs/testing';
import { FileSystemStoredFile, NestjsFormDataModule } from 'nestjs-form-data';
import { Photospot } from 'src/photospot/entities/photospot.entity';
import { PhotospotController } from './photospot.controller';
import { PhotospotService } from './photospot.service';

const moduleMocker = new ModuleMocker(global);

describe('PhotospotController', () => {
  let controller: PhotospotController;
  let service: jest.Mocked<PhotospotService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        NestjsFormDataModule.config({
          storage: FileSystemStoredFile,
          autoDeleteFile: false,
        }),
      ],
      controllers: [PhotospotController],
    })
      .useMocker((token) => {
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    controller = module.get(PhotospotController);
    service = module.get(PhotospotService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST createPhotospot', () => {
    it('should be defined', () => {
      expect(controller.createPhotospot).toBeDefined();
    });

    it('createPhotospot 성공', () => {
      const dto = new CreatePhotospotDto();
      const userId = 1;
      const collectionId = 1;

      service.createPhotospot(dto, userId, collectionId);
      expect(service.createPhotospot).toHaveBeenCalledTimes(1);
      expect(service.createPhotospot).toHaveBeenCalledWith(dto, userId, collectionId);
    });
  });

  describe('GET getAllPhotospot', () => {
    it('should be defined', () => {
      expect(controller.getAllPhotospot).toBeDefined();
    });

    it('getAllPhotospot 성공', async () => {
      const collectionId = 1;
      await service.getAllPhotospot(collectionId);

      expect(service.getAllPhotospot).toHaveBeenCalledTimes(1);
      expect(service.getAllPhotospot).toHaveBeenCalledWith(collectionId);
    });
  });

  describe('GET getPhotospot', () => {
    it('should be defined', () => {
      expect(controller.getPhotospot).toBeDefined();
    });

    it('getPhotospot 성공', async () => {
      const collectionId = 1;
      await service.getPhotospot(collectionId);

      expect(service.getPhotospot).toHaveBeenCalledTimes(1);
      expect(service.getPhotospot).toHaveBeenCalledWith(collectionId);
    });
  });

  describe('PUT modifyPhotospot', () => {
    it('should be defined', () => {
      expect(controller.modifyPhotospot).toBeDefined();
    });

    it('modifyPhotospot 성공', async () => {
      const dto = new ModifyPhotospotDto();
      const photospotId = 1;
      await service.modifyPhotospot(dto, photospotId);

      expect(service.modifyPhotospot).toHaveBeenCalledTimes(1);
      expect(service.modifyPhotospot).toHaveBeenCalledWith(dto, photospotId);
    });
  });

  describe('DELETE deletePhotospot', () => {
    it('should be defined', () => {
      expect(controller.deletePhotospot).toBeDefined();
    });

    it('deletePhotospot 성공', async () => {
      const photospotId = 1;
      await service.deletePhotospot(photospotId);

      expect(service.deletePhotospot).toHaveBeenCalledTimes(1);
      expect(service.deletePhotospot).toHaveBeenCalledWith(photospotId);
    });
  });
});
