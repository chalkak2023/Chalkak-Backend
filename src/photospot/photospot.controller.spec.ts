import { FileSystemStoredFile } from 'nestjs-form-data/dist/classes/storage';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { Test, TestingModule } from '@nestjs/testing';
import { CreatePhotospotDto } from './dto/create-photospot.dto';
import { PhotospotController } from './photospot.controller';
import { PhotospotService } from './photospot.service';

describe('PhotospotController', () => {
  let photoController: PhotospotController;
  let spyService: PhotospotService;

  beforeAll(async () => {
    const PhotospotProvider = {
      provide: PhotospotService,
      useFactory: () => ({
        createPhotospot: jest.fn(() => []),
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
      providers: [PhotospotService, PhotospotProvider],
    }).compile();

    photoController = app.get<PhotospotController>(PhotospotController);
    spyService = app.get<PhotospotService>(PhotospotService);
  });

  it('calling createPhotospot method', () => {
    const dto = new CreatePhotospotDto();
    expect(photoController.createPhotospot(dto)).not.toEqual(null);
  });

  it('calling createPhotospot method', () => {
    const dto = new CreatePhotospotDto();
    photoController.createPhotospot(dto);
    expect(spyService.createPhotospot).toHaveBeenCalled();
    expect(spyService.createPhotospot).toHaveBeenCalledWith(dto);
  })
});
