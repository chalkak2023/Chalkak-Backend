import {
  BadRequestException,
  CACHE_MANAGER,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TestingModule, Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { MailerAuthService } from 'src/mailer/services/mailer.auth.service';
import { SocialService } from 'src/social/services/social.service';
import { ISocialProvider, ISocialUserInfo } from 'src/social/social.interface';
import { FindOneOptions, FindOptionsWhere, InsertResult, Repository } from 'typeorm';
import { AuthService } from '../auth.service';
import {
  ChangePasswordBodyDTO,
  decodedAccessTokenDTO,
  PostEmailVerificationBodyDTO,
  PutChangePasswordVerificationBodyDTO,
  PutEmailVerificationBodyDTO,
  SignUpBodyDTO,
  SocialLoginBodyDTO,
} from '../dto/auth.dto';
import { User, LocalUser, KakaoUser, NaverUser } from '../entities/user.entity';
import { AuthCacheService } from '../services/auth.cache.service';
import { AuthHashService } from '../services/auth.hash.service';
import { AuthJwtService } from '../services/auth.jwt.service';

const moduleMocker = new ModuleMocker(global);

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersRepository: jest.Mocked<Repository<User>>;
  let mockLocalUsersRepository: jest.Mocked<Repository<LocalUser>>;
  let mockKakaoUsersRepository: jest.Mocked<Repository<KakaoUser>>;
  let mockNaverUsersRepository: jest.Mocked<Repository<NaverUser>>;
  let mockAuthJwtService: jest.Mocked<AuthJwtService>;
  let mockAuthHashService: jest.Mocked<AuthHashService>;
  let mockAuthCacheService: jest.Mocked<AuthCacheService>;
  let mockMailerAuthService: jest.Mocked<MailerAuthService>;
  let mockSocialService: jest.Mocked<SocialService>;

  // DB 모킹
  let users: Partial<LocalUser | KakaoUser | NaverUser>[] = [
    {
      id: 1,
      username: '정상 로컬 유저',
      email: 'local@gmail.com',
      password: 'testpassword|10',
      provider: 'local',
      isBlock: false,
      createdAt: new Date('2023-02-28T13:46:54.285Z'),
      updatedAt: new Date('2023-02-28T13:49:32.285Z'),
      deletedAt: null,
    },
    {
      id: 2,
      username: '블락 로컬 유저',
      email: 'test@naver.com',
      password: 'testpassword|10',
      provider: 'local',
      isBlock: true,
      createdAt: new Date('2023-02-28T13:50:22.225Z'),
      updatedAt: new Date('2023-02-28T13:50:32.144Z'),
      deletedAt: new Date('2023-02-28T13:53:03.387Z'),
    },
    {
      id: 3,
      username: '카카오 유저',
      providerUserId: 1234,
      provider: 'kakao',
      isBlock: false,
      createdAt: new Date('2023-02-28T13:50:22.225Z'),
      updatedAt: new Date('2023-02-28T13:50:32.144Z'),
      deletedAt: new Date('2023-02-28T13:53:03.387Z'),
    },
    {
      id: 3,
      username: '네이버 유저',
      providerUserId: 'qwer',
      provider: 'naver',
      isBlock: false,
      createdAt: new Date('2023-02-28T13:50:22.225Z'),
      updatedAt: new Date('2023-02-28T13:50:32.144Z'),
      deletedAt: new Date('2023-02-28T13:53:03.387Z'),
    },
  ];
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
    users = [
      {
        id: 1,
        username: '정상 로컬 유저',
        email: 'local@gmail.com',
        password: 'testpassword|10',
        provider: 'local',
        isBlock: false,
        createdAt: new Date('2023-02-28T13:46:54.285Z'),
        updatedAt: new Date('2023-02-28T13:49:32.285Z'),
        deletedAt: null,
      },
      {
        id: 2,
        username: '블락 로컬 유저',
        email: 'test@naver.com',
        password: 'testpassword|10',
        provider: 'local',
        isBlock: true,
        createdAt: new Date('2023-02-28T13:50:22.225Z'),
        updatedAt: new Date('2023-02-28T13:50:32.144Z'),
        deletedAt: new Date('2023-02-28T13:53:03.387Z'),
      },
      {
        id: 3,
        username: '카카오 유저',
        providerUserId: 1234,
        provider: 'kakao',
        isBlock: false,
        createdAt: new Date('2023-02-28T13:50:22.225Z'),
        updatedAt: new Date('2023-02-28T13:50:32.144Z'),
        deletedAt: new Date('2023-02-28T13:53:03.387Z'),
      },
      {
        id: 3,
        username: '네이버 유저',
        providerUserId: 'qwer',
        provider: 'naver',
        isBlock: false,
        createdAt: new Date('2023-02-28T13:50:22.225Z'),
        updatedAt: new Date('2023-02-28T13:50:32.144Z'),
        deletedAt: new Date('2023-02-28T13:53:03.387Z'),
      },
    ];
    cache = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    })
      .useMocker((token) => {
        if (
          token === getRepositoryToken(User) ||
          token === getRepositoryToken(LocalUser) ||
          token === getRepositoryToken(KakaoUser) ||
          token === getRepositoryToken(NaverUser)
        ) {
          return {
            insert: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          };
        }
        if (token === CACHE_MANAGER) {
          return {
            get: jest.fn().mockImplementation((key: string) => cache[key]),
            set: jest.fn().mockImplementation((key: string, value: any, options: any) => (cache[key] = value)),
            del: jest.fn().mockImplementation((key: string) => {
              delete cache[key];
            }),
          };
        }
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

    service = module.get(AuthService);
    mockUsersRepository = module.get(getRepositoryToken(User));
    mockLocalUsersRepository = module.get(getRepositoryToken(LocalUser));
    mockKakaoUsersRepository = module.get(getRepositoryToken(KakaoUser));
    mockNaverUsersRepository = module.get(getRepositoryToken(NaverUser));
    mockAuthCacheService = module.get(AuthCacheService);
    mockAuthHashService = module.get(AuthHashService);
    mockAuthJwtService = module.get(AuthJwtService);
    mockSocialService = module.get(SocialService);
    mockMailerAuthService = module.get(MailerAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp Method(회원가입 메소드)', () => {
    it('should be defined', () => {
      expect(service.signUp).toBeDefined();
      expect(typeof service.signUp).toBe('function');
    });

    it('정상적으로 성공', async () => {
      const body: SignUpBodyDTO = {
        username: '정상 유저',
        email: 'testman@gmail.com',
        password: 'testpassword',
        verifyToken: 123456,
      };

      mockLocalUsersRepository.findOne.mockResolvedValueOnce(null);
      mockAuthCacheService.getVerifyToken.mockResolvedValueOnce(body.verifyToken);
      mockUsersRepository.findOne.mockResolvedValueOnce(null);
      mockAuthHashService.hashPassword.mockReturnValue(body.password + '|10');

      mockLocalUsersRepository.insert.mockResolvedValueOnce({ raw: [], affected: 1 } as unknown as InsertResult);

      expect(service.signUp(body)).resolves.toStrictEqual({
        message: '회원가입 되었습니다.',
      });
    });

    it('이미 가입된 이메일', () => {
      const email = users[0]?.email!;
      const body: SignUpBodyDTO = {
        username: '유니크 닉네임',
        email,
        password: 'qwer1234',
        verifyToken: 123456,
      };

      mockLocalUsersRepository.findOne.mockResolvedValueOnce(users[0] as LocalUser);

      expect(service.signUp(body)).rejects.toThrowError(
        new ConflictException({
          message: '이미 가입된 이메일입니다.',
        })
      );
    });

    it('인증번호 캐시에 없음', () => {
      const username = users[0].username!;
      const body: SignUpBodyDTO = {
        username,
        email: 'test5@gmail.com',
        password: 'qwer1234',
        verifyToken: 123456,
      };

      mockLocalUsersRepository.findOne.mockResolvedValueOnce(null);
      mockAuthCacheService.getVerifyToken.mockResolvedValueOnce(undefined);

      expect(service.signUp(body)).rejects.toThrowError(
        new NotFoundException({
          message: '인증번호를 요청하지 않았거나 만료되었습니다.',
        })
      );
    });

    it('인증번호가 다름', () => {
      const username = users[0].username!;
      const body: SignUpBodyDTO = {
        username,
        email: 'test5@gmail.com',
        password: 'qwer1234',
        verifyToken: 123456,
      };

      mockLocalUsersRepository.findOne.mockResolvedValueOnce(null);
      mockAuthCacheService.getVerifyToken.mockResolvedValueOnce(body.verifyToken + 1);

      expect(service.signUp(body)).rejects.toThrowError(
        new UnauthorizedException({
          message: '인증번호가 일치하지 않습니다.',
        })
      );
    });

    it('닉네임 중복', () => {
      const username = users[0].username!;
      const body: SignUpBodyDTO = {
        username,
        email: 'test5@gmail.com',
        password: 'qwer1234',
        verifyToken: 123456,
      };

      mockLocalUsersRepository.findOne.mockResolvedValueOnce(null);
      mockAuthCacheService.getVerifyToken.mockResolvedValueOnce(body.verifyToken);
      mockUsersRepository.findOne.mockResolvedValueOnce(users[0] as User);

      expect(service.signUp(body)).rejects.toThrowError(
        new ConflictException({
          message: '해당 닉네임으로 이미 가입한 유저가 존재합니다.',
        })
      );
    });

    it('회원가입 insert에서 에러 발생', async () => {
      const body: SignUpBodyDTO = {
        username: 'testman',
        email: 'test@gmail.com',
        password: 'testpassword',
        verifyToken: 123456,
      };

      mockLocalUsersRepository.findOne.mockResolvedValueOnce(null);
      mockAuthCacheService.getVerifyToken.mockResolvedValueOnce(body.verifyToken);
      mockUsersRepository.findOne.mockResolvedValueOnce(null);
      mockAuthHashService.hashPassword.mockReturnValue(body.password + '|10');
      mockLocalUsersRepository.insert.mockRejectedValue(new Error());

      expect(service.signUp(body)).rejects.toThrowError(
        new ConflictException({
          message: '회원가입하는데 문제가 발생했습니다.',
        })
      );
    });
  });

  describe('validateLocalUser', () => {
    it('should be defined', () => {
      expect(service.validateLocalUser).toBeDefined();
      expect(typeof service.validateLocalUser).toBe('function');
    });

    it('정상 작동', () => {
      mockLocalUsersRepository.findOne.mockResolvedValueOnce(users[0] as LocalUser);
      mockAuthHashService.comparePassword.mockReturnValueOnce(true);

      expect(service.validateLocalUser('testman@gmail.com', 'test1234!')).resolves.toBe(users[0]);
    });

    it('이메일이 일치하지 않음', () => {
      mockLocalUsersRepository.findOne.mockResolvedValueOnce(null);
      mockAuthHashService.comparePassword.mockReturnValueOnce(true);

      expect(service.validateLocalUser('testman@gmail.com', 'test1234!')).rejects.toThrowError(
        new UnauthorizedException({ message: '이메일이나 비밀번호가 일치하지 않습니다.' })
      );
    });

    it('비밀번호가 일치하지 않음', () => {
      mockLocalUsersRepository.findOne.mockResolvedValueOnce(users[0] as LocalUser);
      mockAuthHashService.comparePassword.mockReturnValueOnce(false);

      expect(service.validateLocalUser('testman@gmail.com', 'test1234!')).rejects.toThrowError(
        new UnauthorizedException({ message: '이메일이나 비밀번호가 일치하지 않습니다.' })
      );
    });

    it('블락된 상태임', () => {
      mockLocalUsersRepository.findOne.mockResolvedValueOnce(users[1] as LocalUser);
      mockAuthHashService.comparePassword.mockReturnValueOnce(true);

      expect(service.validateLocalUser('testman@gmail.com', 'test1234!')).rejects.toThrowError(
        new ForbiddenException({ message: '블락된 유저는 로그인을 할 수 없습니다.' })
      );
    });
  });

  describe('signIn', () => {
    it('should be defined', () => {
      expect(service.signIn).toBeDefined();
      expect(typeof service.signIn).toBe('function');
    });

    it('정상 작동', () => {
      const accessToken = 'accessToken';
      const refreshToken = 'refreshToken';
      mockAuthJwtService.generateUserAccessToken.mockReturnValueOnce(accessToken);
      mockAuthJwtService.generateUserRefreshToken.mockReturnValueOnce(refreshToken);

      expect(service.signIn(users[0] as LocalUser)).resolves.toStrictEqual({
        message: '로그인 되었습니다.',
        accessToken,
        refreshToken,
      });
    });
  });

  describe('signOut', () => {
    it('should be defined', () => {
      expect(service.signOut).toBeDefined();
      expect(typeof service.signOut).toBe('function');
    });

    it('정상 작동', () => {
      const refreshToken = 'refreshToken';

      expect(service.signOut(refreshToken)).resolves.toStrictEqual({
        message: '로그아웃 되었습니다.',
      });
    });
  });

  describe('postSignupEmailVerification', () => {
    it('should be defined', () => {
      expect(service.postSignupEmailVerification).toBeDefined();
      expect(typeof service.postSignupEmailVerification).toBe('function');
    });

    it('정상 작동', () => {
      const body: PostEmailVerificationBodyDTO = {
        email: 'test@gmail.com',
      };

      mockLocalUsersRepository.findOne.mockResolvedValueOnce(null);

      expect(service.postSignupEmailVerification(body)).resolves.toStrictEqual({
        message: '회원가입 이메일 인증번호가 요청되었습니다.',
      });
    });

    it('이미 가입된 이메일', () => {
      const body: PostEmailVerificationBodyDTO = {
        email: 'test@gmail.com',
      };

      mockLocalUsersRepository.findOne.mockResolvedValueOnce(users[0] as LocalUser);

      expect(service.postSignupEmailVerification(body)).rejects.toThrowError(
        new ConflictException({
          message: '이미 가입된 이메일입니다.',
        })
      );
    });
  });

  describe('putSignupEmailVerification', () => {
    it('should be defined', () => {
      expect(service.putSignupEmailVerification).toBeDefined();
      expect(typeof service.putSignupEmailVerification).toBe('function');
    });

    it('정상 작동', () => {
      const body: PutEmailVerificationBodyDTO = {
        email: 'test@gmail.com',
        verifyToken: 123456,
      };

      mockAuthCacheService.getVerifyToken.mockResolvedValueOnce(body.verifyToken);

      expect(service.putSignupEmailVerification(body)).resolves.toStrictEqual({
        message: '회원가입 이메일 인증번호가 확인되었습니다.',
      });
    });

    it('인증번호가 캐시되어있지 않음', () => {
      const body: PutEmailVerificationBodyDTO = {
        email: 'test@gmail.com',
        verifyToken: 123456,
      };

      mockAuthCacheService.getVerifyToken.mockResolvedValueOnce(undefined);

      expect(service.putSignupEmailVerification(body)).rejects.toThrowError(
        new NotFoundException({
          message: '인증번호를 요청하지 않았거나 만료되었습니다.',
        })
      );
    });

    it('인증번호가 틀림', () => {
      const body: PutEmailVerificationBodyDTO = {
        email: 'test@gmail.com',
        verifyToken: 123456,
      };

      mockAuthCacheService.getVerifyToken.mockResolvedValueOnce(body.verifyToken + 10);

      expect(service.putSignupEmailVerification(body)).rejects.toThrowError(
        new UnauthorizedException({
          message: '인증번호가 일치하지 않습니다.',
        })
      );
    });
  });

  describe('changePassword', () => {
    it('should be defined', () => {
      expect(service.changePassword).toBeDefined();
      expect(typeof service.changePassword).toBe('function');
    });

    it('정상 작동', () => {
      const body: ChangePasswordBodyDTO = {
        password: 'test1234!'
      }

      const decodedPayload: decodedAccessTokenDTO = {
        id: 1,
        username: 'testman',
        email: 'test@gmail.com',
        role: 'user',
      } as decodedAccessTokenDTO;

      expect(service.changePassword(body, decodedPayload)).resolves.toStrictEqual({
        message: '비밀번호가 변경되었습니다.',
      });
    });
  });

  describe('postChangePasswordEmailVerification', () => {
    it('should be defined', () => {
      expect(service.postChangePasswordEmailVerification).toBeDefined();
      expect(typeof service.postChangePasswordEmailVerification).toBe('function');
    });

    it('정상 작동', () => {
      const decodedPayload: decodedAccessTokenDTO = {
        id: 1,
        username: 'testman',
        email: 'test@gmail.com',
        role: 'user',
      } as decodedAccessTokenDTO;

      expect(service.postChangePasswordEmailVerification(decodedPayload)).resolves.toStrictEqual({
        message: '패스워드변경 이메일 인증번호가 요청되었습니다.',
      });
    });

    it('로컬 유저가 아님', () => {
      const decodedPayload: decodedAccessTokenDTO = {
        id: 1,
        username: 'testman',
        role: 'user',
      } as decodedAccessTokenDTO;

      expect(service.postChangePasswordEmailVerification(decodedPayload)).rejects.toThrowError(
        new BadRequestException({
          message: '이메일, 패스워드로 가입한 유저가 아닙니다.',
        })
      );
    });
  });

  describe('putChangePasswordEmailVerification', () => {
    it('should be defined', () => {
      expect(service.putChangePasswordEmailVerification).toBeDefined();
      expect(typeof service.putChangePasswordEmailVerification).toBe('function');
    });

    it('정상 작동', () => {
      const decodedPayload: decodedAccessTokenDTO = {
        id: 1,
        username: 'testman',
        email: 'test@gmail.com',
        role: 'user',
      } as decodedAccessTokenDTO;

      const body: PutChangePasswordVerificationBodyDTO = {
        verifyToken: 123456,
      };

      mockAuthCacheService.getVerifyToken.mockResolvedValueOnce(body.verifyToken);

      expect(service.putChangePasswordEmailVerification(body, decodedPayload)).resolves.toStrictEqual({
        message: '패스워드변경 이메일 인증번호가 확인되었습니다.',
      });
    });

    it('로컬 유저가 아님', () => {
      const decodedPayload: decodedAccessTokenDTO = {
        id: 1,
        username: 'testman',
        role: 'user',
      } as decodedAccessTokenDTO;

      const body: PutChangePasswordVerificationBodyDTO = {
        verifyToken: 123456,
      };

      expect(service.putChangePasswordEmailVerification(body, decodedPayload)).rejects.toThrowError(
        new BadRequestException({
          message: '이메일, 패스워드로 가입한 유저가 아닙니다.',
        })
      );
    });

    it('인증번호가 캐시되어있지 않음', () => {
      const decodedPayload: decodedAccessTokenDTO = {
        id: 1,
        username: 'testman',
        email: 'test@gmail.com',
        role: 'user',
      } as decodedAccessTokenDTO;

      const body: PutChangePasswordVerificationBodyDTO = {
        verifyToken: 123456,
      };

      mockAuthCacheService.getVerifyToken.mockResolvedValueOnce(undefined);

      expect(service.putChangePasswordEmailVerification(body, decodedPayload)).rejects.toThrowError(
        new NotFoundException({
          message: '인증번호를 요청하지 않았거나 만료되었습니다.',
        })
      );
    });

    it('인증번호가 틀림', () => {
      const decodedPayload: decodedAccessTokenDTO = {
        id: 1,
        username: 'testman',
        email: 'test@gmail.com',
        role: 'user',
      } as decodedAccessTokenDTO;

      const body: PutChangePasswordVerificationBodyDTO = {
        verifyToken: 123456,
      };

      mockAuthCacheService.getVerifyToken.mockResolvedValueOnce(body.verifyToken + 10);

      expect(service.putChangePasswordEmailVerification(body, decodedPayload)).rejects.toThrowError(
        new UnauthorizedException({
          message: '인증번호가 일치하지 않습니다.',
        })
      );
    });
  });

  describe('oauthSignIn', () => {
    it('should be defined', () => {
      expect(service.oauthSignIn).toBeDefined();
      expect(typeof service.oauthSignIn).toBe('function');
    });

    it('카카오 로그인 정상 작동', () => {
      const provider: ISocialProvider = 'kakao';
      const body: SocialLoginBodyDTO = {
        code: 'test',
      };
      const userInfo = {
        accessToken: 'social',
        refreshToken: 'social2',
        providerUserId: 1,
        username: 'social-nickname',
      };
      const accessToken = 'accessToken';
      const refreshToken = 'refreshToken';

      mockSocialService.validateSocialUser.mockResolvedValueOnce(userInfo);
      mockUsersRepository.findOne.mockResolvedValueOnce(null);
      mockKakaoUsersRepository.findOne.mockResolvedValueOnce(null);
      mockKakaoUsersRepository.findOne.mockResolvedValueOnce(users[2] as KakaoUser);
      mockAuthJwtService.generateUserAccessToken.mockReturnValueOnce(accessToken);
      mockAuthJwtService.generateUserRefreshToken.mockReturnValueOnce(refreshToken);

      expect(service.oauthSignIn(provider, body)).resolves.toStrictEqual({
        accessToken,
        refreshToken,
        message: '로그인되었습니다.',
      });
    });

    it('카카오 로그인의 닉네임이 다른 닉네임과 같아도 정상 작동', () => {
      const provider: ISocialProvider = 'kakao';
      const body: SocialLoginBodyDTO = {
        code: 'test',
      };
      const userInfo = {
        accessToken: 'social',
        refreshToken: 'social2',
        providerUserId: 1,
        username: 'social-nickname',
      };
      const accessToken = 'accessToken';
      const refreshToken = 'refreshToken';

      mockSocialService.validateSocialUser.mockResolvedValueOnce(userInfo);
      mockUsersRepository.findOne.mockResolvedValueOnce(users[0] as User);
      mockKakaoUsersRepository.findOne.mockResolvedValueOnce(null);
      mockKakaoUsersRepository.findOne.mockResolvedValueOnce(users[2] as KakaoUser);
      mockAuthJwtService.generateUserAccessToken.mockReturnValueOnce(accessToken);
      mockAuthJwtService.generateUserRefreshToken.mockReturnValueOnce(refreshToken);

      expect(service.oauthSignIn(provider, body)).resolves.toStrictEqual({
        accessToken,
        refreshToken,
        message: '로그인되었습니다.',
      });
    });

    it('네이버 로그인 정상 작동', () => {
      const provider: ISocialProvider = 'naver';
      const body: SocialLoginBodyDTO = {
        code: 'test',
        state: 'chalkak',
      };
      const userInfo = {
        accessToken: 'social',
        refreshToken: 'social2',
        providerUserId: 1,
        username: 'social-nickname',
      };
      const accessToken = 'accessToken';
      const refreshToken = 'refreshToken';

      mockSocialService.validateSocialUser.mockResolvedValueOnce(userInfo);
      mockUsersRepository.findOne.mockResolvedValueOnce(null);
      mockNaverUsersRepository.findOne.mockResolvedValueOnce(null);
      mockNaverUsersRepository.findOne.mockResolvedValueOnce(users[3] as NaverUser);
      mockAuthJwtService.generateUserAccessToken.mockReturnValueOnce(accessToken);
      mockAuthJwtService.generateUserRefreshToken.mockReturnValueOnce(refreshToken);

      expect(service.oauthSignIn(provider, body)).resolves.toStrictEqual({
        accessToken,
        refreshToken,
        message: '로그인되었습니다.',
      });
    });

    it('네이버 로그인 insert 실패', () => {
      const provider: ISocialProvider = 'naver';
      const body: SocialLoginBodyDTO = {
        code: 'test',
        state: 'chalkak',
      };
      const userInfo = {
        accessToken: 'social',
        refreshToken: 'social2',
        providerUserId: 1,
        username: 'social-nickname',
      };
      const accessToken = 'accessToken';
      const refreshToken = 'refreshToken';

      mockSocialService.validateSocialUser.mockResolvedValueOnce(userInfo);
      mockUsersRepository.findOne.mockResolvedValueOnce(null);
      mockNaverUsersRepository.findOne.mockResolvedValueOnce(null);
      mockNaverUsersRepository.insert.mockRejectedValueOnce(new Error());
      mockNaverUsersRepository.findOne.mockResolvedValueOnce(users[3] as NaverUser);
      mockAuthJwtService.generateUserAccessToken.mockReturnValueOnce(accessToken);
      mockAuthJwtService.generateUserRefreshToken.mockReturnValueOnce(refreshToken);

      expect(service.oauthSignIn(provider, body)).rejects.toThrowError(
        new ConflictException({
          message: '가입에 실패했습니다.',
        })
      );
    });

    it('네이버 로그인 블락 실패', () => {
      const provider: ISocialProvider = 'naver';
      const body: SocialLoginBodyDTO = {
        code: 'test',
        state: 'chalkak',
      };
      const userInfo = {
        accessToken: 'social',
        refreshToken: 'social2',
        providerUserId: 1,
        username: 'social-nickname',
      };
      const accessToken = 'accessToken';
      const refreshToken = 'refreshToken';

      mockSocialService.validateSocialUser.mockResolvedValueOnce(userInfo);
      mockUsersRepository.findOne.mockResolvedValueOnce(null);
      mockNaverUsersRepository.findOne.mockResolvedValueOnce(null);
      mockNaverUsersRepository.findOne.mockResolvedValueOnce(users[1] as NaverUser);
      mockAuthJwtService.generateUserAccessToken.mockReturnValueOnce(accessToken);
      mockAuthJwtService.generateUserRefreshToken.mockReturnValueOnce(refreshToken);

      expect(service.oauthSignIn(provider, body)).rejects.toThrowError(
        new ForbiddenException({
          message: '블락된 상태여서 로그인할 수 없습니다.',
        })
      );
    });
  });

  describe('renewAccessToken', () => {
    it('should be defined', () => {
      expect(service.renewAccessToken).toBeDefined();
      expect(typeof service.renewAccessToken).toBe('function');
    });

    it('정상 작동', () => {
      const accessToken = 'accessToken';
      const newAccessToken = 'newAccessToken';
      const refreshToken = 'refreshToken';

      mockUsersRepository.findOne.mockResolvedValueOnce({
        ...users[0],
        email: 'test@gmail.com',
      } as LocalUser);
      mockAuthCacheService.getUserIdByRefreshToken.mockResolvedValueOnce(users[0].id);
      mockAuthJwtService.generateUserAccessToken.mockReturnValueOnce(newAccessToken);

      expect(service.renewAccessToken(accessToken, refreshToken)).resolves.toStrictEqual({
        accessToken: newAccessToken,
        message: '액세스 토큰을 재발급받았습니다.',
      });
    });

    it('리프레시 토큰 사용 만료', () => {
      const accessToken = 'accessToken';
      const refreshToken = 'refreshToken';
      cache = {};
      mockAuthCacheService.getUserIdByRefreshToken.mockResolvedValueOnce(undefined);

      expect(service.renewAccessToken(accessToken, refreshToken)).rejects.toThrowError(
        new UnauthorizedException({
          message: '리프레시 토큰이 사용 만료되었습니다.',
        })
      );
    });

    it('탈퇴한 유저', () => {
      const accessToken = 'accessToken';
      const refreshToken = 'refreshToken';
      cache = {
        refreshToken: 1,
      };
      mockAuthCacheService.getUserIdByRefreshToken.mockResolvedValueOnce(users[0].id);
      mockUsersRepository.findOne.mockResolvedValueOnce(null);

      expect(service.renewAccessToken(accessToken, refreshToken)).rejects.toThrowError(
        new NotFoundException({
          message: '탈퇴한 유저입니다.',
        })
      );
    });
  });
});
