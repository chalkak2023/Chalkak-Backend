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
      expect(controller.createPhotospot).toBeDefined();
    });

    it('getAllPhotospot 성공', () => {
      const collectionId = 1;
      const photospots = new Photospot();
      service.getAllPhotospot(collectionId);

      expect(service.getAllPhotospot).toHaveBeenCalledTimes(1);
      expect(service.getAllPhotospot).toHaveBeenCalledWith(collectionId);
    });
  });
});
