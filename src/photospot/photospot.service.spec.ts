import { Param } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import * as sinon from 'sinon';
import { Repository } from 'typeorm';
import { FileSystemStoredFile } from 'nestjs-form-data/dist/classes/storage';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { Test, TestingModule } from '@nestjs/testing';
import { CreatePhotospotDto } from './dto/create-photospot.dto';
import { PhotospotController } from './photospot.controller';
import { PhotospotService } from './photospot.service';
import { Photospot } from 'src/photospot/entities/photospot.entity';
import { S3Service } from './../common/aws/s3.service';
import { TypeOrmConfigService } from './../common/config/typeorm.config.service';

describe('PhotospotService', () => {
  let photoService: PhotospotService;
  let spyS3Service: S3Service;
  let sandbox: sinon.SinonSandbox;

  beforeAll(async () => {
    sandbox = sinon.createSandbox();
    const S3ServiceProvider = {
      provide: S3Service,
      useFactory: () => ({
        putObject: jest.fn(() => {}),
      }),
    };

    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
        TypeOrmModule.forFeature([Photospot]),
        NestjsFormDataModule.config({
          storage: FileSystemStoredFile,
          autoDeleteFile: false,
        }),
      ],
      controllers: [PhotospotController],
      providers: [
        PhotospotService,
        S3Service,
        S3ServiceProvider,
        {
          provide: getRepositoryToken(Photospot),
          useValue: sinon.createStubInstance(Repository),
        },
      ],
    }).compile();

    photoService = app.get<PhotospotService>(PhotospotService);
    spyS3Service = app.get<S3Service>(S3Service);
  });

  it('calling Service createPhotospot method', () => {
    const dto = new CreatePhotospotDto();
    const userId = 1;
    const collectionId = 1;
    expect(photoService.createPhotospot(dto, userId, collectionId)).not.toEqual(null);
  });

  it('calling S3Service putObject method', () => {
    const dto = new CreatePhotospotDto();
    const userId = 1;
    const collectionId = 1;

    photoService.createPhotospot(dto, userId, collectionId);
    expect(spyS3Service.putObject).toHaveBeenCalled();
    expect(spyS3Service.putObject).toHaveBeenCalledWith(dto.image);
  });

  it('calling Service getAllPhotospot method', () => {
    const collectionId = 1;

    expect(photoService.getAllPhotospot(collectionId)).not.toEqual(null);
  });

  it('calling Service getPhotospot method', () => {
    const param = {collectionId: 1, photospotId: 1}

    expect(photoService.getPhotospot(param)).not.toEqual(null);
  })

  afterAll(async () => {
    sandbox.restore();
  });
});
