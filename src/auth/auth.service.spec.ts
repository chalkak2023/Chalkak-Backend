import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

class AuthServiceMock {
  createSampleUser() {
    return [];
  }
}

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthService,
          useClass: AuthServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSampleUser', () => {
    it('should create 5 sample user', async () => {
      const createSampleUserSpy = jest.spyOn(service, 'createSampleUser');
      await service.createSampleUser();
      expect(createSampleUserSpy).toHaveBeenCalledWith();
    });
    it('it must generate an error, getMeetups return an error', async () => {
      jest.spyOn(service, 'createSampleUser').mockImplementation(() => {
        throw new Error('error');
      });
      try {
        await service.createSampleUser();
      } catch (err) {
        expect(err.message).toEqual('error');
      }
    });
  });
});
