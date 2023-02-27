import { Test, TestingModule } from '@nestjs/testing';
import { PhotospotController } from './photospot.controller';

describe('PhotospotController', () => {
  let controller: PhotospotController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhotospotController],
    }).compile();

    controller = module.get<PhotospotController>(PhotospotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
