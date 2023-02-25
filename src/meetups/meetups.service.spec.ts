import { Test, TestingModule } from '@nestjs/testing';
import { MeetupsService } from './meetups.service';

describe('MeetupsService', () => {
  let service: MeetupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MeetupsService],
    }).compile();

    service = module.get<MeetupsService>(MeetupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
