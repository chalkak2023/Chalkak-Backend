import { FileSystemStoredFile } from 'nestjs-form-data/dist/classes/storage';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { Test, TestingModule } from '@nestjs/testing';
import { CreatePhotospotDto } from './dto/create-photospot.dto';
import { PhotospotController } from './photospot.controller';
import { PhotospotService } from './photospot.service';

describe.skip('PhotospotController', () => {
  let photoController: PhotospotController;
  let spyService: PhotospotService;

  beforeAll(async () => {
    const PhotospotServiceProvider = {
      provide: PhotospotService,
      useFactory: () => ({
        createPhotospot: jest.fn(() => {}),
        getAllPhotospot: jest.fn(() => []),
        getPhotospot: jest.fn(() => {}),
      }),
    };
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        NestjsFormDataModule.config({
          storage: FileSystemStoredFile,
          autoDeleteFile: false,
        }),
      ],
      controllers: [PhotospotController],
      providers: [PhotospotService, PhotospotServiceProvider],
    }).compile();

    photoController = app.get<PhotospotController>(PhotospotController);
    spyService = app.get<PhotospotService>(PhotospotService);
  });

  it('calling Controller createPhotospot method', () => {
    const dto = new CreatePhotospotDto();
    const collectionId = 1;
    expect(photoController.createPhotospot(dto, collectionId)).not.toEqual(null);
  });

  it('calling Service createPhotospot method', () => {
    const dto = new CreatePhotospotDto();
    const userId = 1;
    const collectionId = 1;

    photoController.createPhotospot(dto, collectionId);
    expect(spyService.createPhotospot).toHaveBeenCalled();
    expect(spyService.createPhotospot).toHaveBeenCalledWith(dto, userId, collectionId);
  });

  it('calling Controller getAllPhotospot method', () => {
    const collectionId = 1;
    expect(photoController.getAllPhotospot(collectionId)).not.toEqual(null);
  });

  it('calling Service getAllPhotospot method', () => {
    const collectionId = 1;

    photoController.getAllPhotospot(collectionId);
    expect(spyService.getAllPhotospot).toHaveBeenCalled();
    expect(spyService.getAllPhotospot).toHaveBeenCalledWith(collectionId);
  });

  it('calling Controller getPhotospot method', () => {
    const param = { collectionId: 1, photospotId: 1 };

    expect(photoController.getPhotospot(param)).not.toEqual(null);
  });

  it('calling Service getPhotospot method', () => {
    const param = { collectionId: 1, photospotId: 1 };

    photoController.getPhotospot(param);
    expect(spyService.getPhotospot).toHaveBeenCalled();
    expect(spyService.getPhotospot).toHaveBeenCalledWith(param);
  })
});
