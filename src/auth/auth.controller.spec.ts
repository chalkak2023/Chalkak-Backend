import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const mockProvider = {
      provide: AuthService,
      useFactory: () => ({
        createSampleUser: jest.fn(() => []),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, mockProvider],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /api/auth/sample', () => {
    it('createSampleUser method', () => {
      expect(controller.createSampleUser()).not.toEqual(null);
    });
    it('createSampleUser method', () => {
      controller.createSampleUser();
      expect(service.createSampleUser).toHaveBeenCalled();
      expect(service.createSampleUser).toHaveBeenCalledWith();
    });
    it('if calling createSampleUser and receive a specific error', async () => {
      jest.spyOn(controller, 'createSampleUser').mockImplementation(() => {
        throw new Error('error');
      });
      try {
        await controller.createSampleUser();
      } catch (err) {
        expect(err).toBeDefined();
        expect(err.message).toEqual('error');
      }
    });
  });
});
