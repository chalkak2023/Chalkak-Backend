import { CACHE_MANAGER } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { verifyTokenType } from '../auth.interface';
import { AuthCacheService } from '../service/auth.cache.service';

const moduleMocker = new ModuleMocker(global);

describe('AuthCacheService', () => {
  let service: AuthCacheService;
  let mockCacheManager: jest.Mocked<Cache>;

  // 캐시(레디스 등) 모킹
  let cache: Record<string, any> = {};
  // config
  let config = {
    JWT_ACCESS_TOKEN_SECRET: 'accessToken',
    JWT_ACCESS_TOKEN_EXPIRES_IN: '1h',
    JWT_REFRESH_TOKEN_SECRET: 'refreshToken',
    JWT_ACCESS_TOKEN_EXPIRES_INT: '7d',
  };

  beforeEach(async () => {
    cache = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthCacheService],
    })
      .useMocker((token) => {
        if (token === CACHE_MANAGER) {
          return {
            get: jest.fn().mockImplementation((key: string) => cache[key]),
            set: jest.fn().mockImplementation((key: string, value: any) => (cache[key] = value)),
            del: jest.fn().mockImplementation((key: string) => {
              delete cache[key];
            }),
          };
        }
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    service = module.get(AuthCacheService);
    mockCacheManager = module.get(CACHE_MANAGER)
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getVerifyToken', () => {
    it('should be defined', () => {
      expect(service.getVerifyToken).toBeDefined();
      expect(typeof service.getVerifyToken).toBe('function');
    });

    it('정상 작동', () => {
      const type: verifyTokenType = 'signup';
      const email = 'test@gmail.com';
      const verifyToken = 123456;

      cache = {
        [`${email}_${type}`]: verifyToken
      }

      expect(service.getVerifyToken(type, email)).resolves.toBe(verifyToken);
    })
  })

  describe('storeVerifyToken', () => {
    it('should be defined', () => {
      expect(service.storeVerifyToken).toBeDefined();
      expect(typeof service.storeVerifyToken).toBe('function');
    });

    it('정상 작동', () => {
      const type: verifyTokenType = 'signup';
      const email = 'test@gmail.com';
      const verifyToken = 123456;

      cache = {}

      expect(service.storeVerifyToken(type, email, verifyToken)).resolves.toBe(undefined);
      expect(mockCacheManager.set).toHaveBeenCalledTimes(1);
      expect(mockCacheManager.set).toHaveBeenCalledWith(`${email}_${type}`, verifyToken, { ttl: 60 * 5 });
      expect(cache[`${email}_${type}`]).toBe(verifyToken);
    })
  })

  describe('getUserIdByRefreshToken', () => {
    it('should be defined', () => {
      expect(service.getUserIdByRefreshToken).toBeDefined();
      expect(typeof service.getUserIdByRefreshToken).toBe('function');
    });

    it('정상 작동', () => {
      const refreshToken = 'refreshToken'
      const userId = 1

      cache = {
        [refreshToken]: userId
      }

      expect(service.getUserIdByRefreshToken(refreshToken)).resolves.toBe(userId);
    })
  })

  describe('storeRefreshToken', () => {
    it('should be defined', () => {
      expect(service.storeRefreshToken).toBeDefined();
      expect(typeof service.storeRefreshToken).toBe('function');
    });

    it('정상 작동', () => {
      const email = 'test@gmail.com';
      const refreshToken = 'refreshToken'
      const userId = 1

      cache = {}

      expect(service.storeRefreshToken(refreshToken, userId)).resolves.toBe(undefined);
      expect(mockCacheManager.set).toHaveBeenCalledTimes(1);
      expect(mockCacheManager.set).toHaveBeenCalledWith(refreshToken, userId, { ttl: 60 * 60 * 3 } );
      expect(cache[refreshToken]).toBe(userId);
    })
  })

  describe('deleteRefreshToken', () => {
    it('should be defined', () => {
      expect(service.deleteRefreshToken).toBeDefined();
      expect(typeof service.deleteRefreshToken).toBe('function');
    });

    it('정상 작동', () => {
      const refreshToken = 'refreshToken'
      const userId = 1

      cache = {
        [refreshToken]: userId
      }

      expect(service.deleteRefreshToken(refreshToken)).resolves.toBe(undefined);
      expect(mockCacheManager.del).toHaveBeenCalledTimes(1);
      expect(mockCacheManager.del).toHaveBeenCalledWith(refreshToken);
      expect(cache[refreshToken]).toBe(undefined);
    })
  })
});
