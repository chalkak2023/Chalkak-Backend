import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileSystemStoredFile } from 'nestjs-form-data/dist/classes/storage';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { Test, TestingModule } from '@nestjs/testing';
import { PhotospotService } from './photospot.service';
import { Photospot } from 'src/photospot/entities/photospot.entity';
import { S3Service } from './../common/aws/s3.service';
import { TypeOrmConfigService } from './../common/config/typeorm.config.service';

const moduleMocker = new ModuleMocker(global);

describe('PhotospotService', () => {
  let service: PhotospotService;
  let mockPhotospotRepository: jest.Mocked<Repository<Photospot>>;
  let mockS3Service: jest.Mocked<S3Service>;
  const REPOSITORY_TOKEN = getRepositoryToken(Photospot);

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
        TypeOrmModule.forFeature([Photospot]),
      ],
      providers: [PhotospotService, S3Service],
    })
      .useMocker((token) => {
        if (token === REPOSITORY_TOKEN) {
          return {
            insert: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
          };
        }
        if (token === 'function') {
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
});
