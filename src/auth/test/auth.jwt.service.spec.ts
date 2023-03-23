import { CACHE_MANAGER, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TestingModule, Test } from '@nestjs/testing';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { User } from '../entities/user.entity';
import { AuthJwtService } from '../services/auth.jwt.service';

const moduleMocker = new ModuleMocker(global);

describe('AuthJwtService', () => {
  let service: AuthJwtService;
  let mockJwtService: jest.Mocked<JwtService>;

  // config
  let config = {
    JWT_ACCESS_TOKEN_SECRET: 'accessToken',
    JWT_ACCESS_TOKEN_EXPIRES_IN: '1h',
    JWT_REFRESH_TOKEN_SECRET: 'refreshToken',
    JWT_ACCESS_TOKEN_EXPIRES_INT: '7d',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthJwtService],
    })
      .useMocker((token) => {
        if (token === ConfigService) {
          return {
            get: jest.fn().mockImplementation((key: keyof typeof config) => config[key]),
          };
        }
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    service = module.get(AuthJwtService);
    mockJwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateUserAccessToken', () => {
    it('should be defined', () => {
      expect(service.generateUserAccessToken).toBeDefined();
      expect(typeof service.generateUserAccessToken).toBe('function');
    });

    it('정상 작동', () => {
      const user = {
        id: 1,
        username: '정상 로컬 유저',
        email: 'local@gmail.com',
      } as unknown as User;

      const accessToken = 'accessToken';

      mockJwtService.sign.mockReturnValueOnce(accessToken);

      expect(service.generateUserAccessToken(user)).toBe(accessToken);
    });
  });

  describe('generateUserRefreshToken', () => {
    it('should be defined', () => {
      expect(service.generateUserRefreshToken).toBeDefined();
      expect(typeof service.generateUserRefreshToken).toBe('function');
    });

    it('정상 작동', () => {
      const refreshToken = 'refreshToken';

      mockJwtService.sign.mockReturnValueOnce(refreshToken);

      expect(service.generateUserRefreshToken()).toBe(refreshToken);
    });
  });

  describe('verifyUserAccessTokenWithoutExpiresIn', () => {
    it('should be defined', () => {
      expect(service.verifyUserAccessTokenWithoutExpiresIn).toBeDefined();
      expect(typeof service.verifyUserAccessTokenWithoutExpiresIn).toBe('function');
    });

    it('정상 작동', () => {
      const accessToken = 'accessToken';

      expect(service.verifyUserAccessTokenWithoutExpiresIn(accessToken)).resolves.toBe(undefined);
    });
    
    it('유효기간 만료는 정상작동', () => {
      const accessToken = 'accessToken';
      const err = new Error();
      err.name = 'TokenExpiredError';
      mockJwtService.verifyAsync.mockRejectedValueOnce(err);

      expect(service.verifyUserAccessTokenWithoutExpiresIn(accessToken)).resolves.toBe(undefined);
    });

    it('정상토큰이 아님', () => {
      const accessToken = 'fakeAccessToken';
      const err = new Error();
      err.name = 'JsonWebTokenError';
      mockJwtService.verifyAsync.mockRejectedValueOnce(err);

      expect(service.verifyUserAccessTokenWithoutExpiresIn(accessToken)).rejects.toThrowError(
        new UnauthorizedException({
          message: '정상 발급된 액세스 토큰이 아닙니다.',
        })
      );
    });
  });
});
