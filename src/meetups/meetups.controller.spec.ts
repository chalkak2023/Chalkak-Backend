import { Test, TestingModule } from '@nestjs/testing';
import { MeetupsController } from './meetups.controller';
import { MeetupsService } from './meetups.service';

describe('MeetupsController', () => {
  let controller: MeetupsController;
  let service: MeetupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeetupsController],
      providers: [
        {
          provide: MeetupsService,
          useFactory: () => ({
            getMeetups: jest.fn(() => 'test'),
          }),
        },
      ],
    }).compile();

    controller = module.get<MeetupsController>(MeetupsController);
    service = module.get<MeetupsService>(MeetupsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /api/meetups', () => {
    it('should return hi', () => {
      const result: string = controller.getMeetups();
      expect(result).toBeDefined();
      expect(result).toEqual('test');
    });
    it('if calling getMeetups and receive a specific error', async () => {
      jest.spyOn(controller, 'getMeetups').mockImplementation(() => {
        throw new Error('error');
      });
      try {
        await controller.getMeetups();
      } catch (err) {
        expect(err).toBeDefined();
        expect(err.message).toEqual('error');
      }
    });
  });
});
