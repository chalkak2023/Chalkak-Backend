import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { getRepositoryToken } from '@nestjs/typeorm';
import { KakaoUser, LocalUser, NaverUser, User } from './entities/user.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerAuthService } from 'src/mailer/service/mailer.auth.service';
import {
  BadRequestException,
  CACHE_MANAGER,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInBodyDTO, SignUpBodyDTO, SocialLoginBodyDTO } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { SocialNaverService } from '../social/service/social.naver.service';
import { SocialKakaoService } from 'src/social/service/social.kakao.service';
jest.mock('bcrypt');

const moduleMocker = new ModuleMocker(global);

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository: jest.Mocked<Repository<User>>;
  let mockLocalUserRepository: jest.Mocked<Repository<LocalUser>>;
  let mockKakaoUserRepository: jest.Mocked<Repository<KakaoUser>>;
  let mockNaverUserRepository: jest.Mocked<Repository<NaverUser>>;
  let mockJwtService: jest.Mocked<JwtService>;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockMailerAuthService: jest.Mocked<MailerAuthService>;
  let mockSocialNaverService: jest.Mocked<SocialNaverService>;
  let mockSocialKakaoService: jest.Mocked<SocialKakaoService>;

  // DB 모킹
  let users: any[] = [];
  // 캐시(레디스 등) 모킹
  let cache: Record<string, any> = {};
  // config
  let config = {};

  beforeAll(() => {
    (bcrypt.hashSync as jest.MockedFunction<typeof bcrypt.hashSync>).mockImplementation(
      (data: string | Buffer, saltOrRounds: string | number) => {
        return data.toString() + '|' + saltOrRounds;
      }
    );
    (bcrypt.compareSync as jest.MockedFunction<typeof bcrypt.compareSync>).mockImplementation(
      (data: string | Buffer, encrypted: string) => {
        const [plain, saltOrRounds] = encrypted.split('|');
        if (!saltOrRounds) {
          return false;
        }
        return data.toString() === plain;
      }
    );

    config = {
      JWT_ACCESS_TOKEN_SECRET: 'accessToken',
      JWT_REFRESH_TOKEN_SECRET: 'refreshToken',
    };
  });

  beforeEach(() => {
    // 데이터셋
    users = [
      {
        id: 1,
        username: 'test',
        email: 'test@gmail.com',
        password: 'testpassword|10',
        isBlock: false,
        createdAt: new Date('2023-02-28T13:46:54.285Z'),
        updatedAt: new Date('2023-02-28T13:49:32.285Z'),
        deletedAt: null,
      },
      {
        id: 2,
        username: 'test1',
        email: 'test@naver.com',
        password: 'testpassword|10',
        isBlock: false,
        createdAt: new Date('2023-02-28T13:50:22.225Z'),
        updatedAt: new Date('2023-02-28T13:50:32.144Z'),
        deletedAt: new Date('2023-02-28T13:53:03.387Z'),
      },
      {
        id: 3,
        username: 'test3',
        email: 'test3@naver.com',
        password: 'testpassword|10',
        isBlock: true,
        createdAt: new Date('2023-02-28T13:50:22.225Z'),
        updatedAt: new Date('2023-02-28T13:50:32.144Z'),
        deletedAt: new Date('2023-02-28T13:53:03.387Z'),
      },
    ];
    // 캐시 초기화
    cache = {};
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    cache = {};
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    })
      .useMocker((token) => {
        if (token === getRepositoryToken(User)) {
          return {
            insert: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
          };
        }
        if (token === getRepositoryToken(LocalUser)) {
          return {
            insert: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
          };
        }
        if (token === getRepositoryToken(KakaoUser)) {
          return {
            insert: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
          };
        }
        if (token === getRepositoryToken(NaverUser)) {
          return {
            insert: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
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
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    service = module.get(AuthService);
    mockUserRepository = module.get(getRepositoryToken(User));
    mockLocalUserRepository = module.get(getRepositoryToken(LocalUser));
    mockKakaoUserRepository = module.get(getRepositoryToken(KakaoUser));
    mockNaverUserRepository = module.get(getRepositoryToken(NaverUser));
    mockJwtService = module.get(JwtService);
    mockConfigService = module.get(ConfigService);
    mockMailerAuthService = module.get(MailerAuthService);
    mockSocialNaverService = module.get(SocialNaverService);
    mockSocialKakaoService = module.get(SocialKakaoService);

    mockConfigService.get.mockImplementation((key: keyof typeof config) => config[key]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp Method(회원가입 메소드)', () => {
    it('should be defined', () => {
      expect(service.signUp).toBeDefined();
      expect(typeof service.signUp).toBe('function');
    });

    it('should be return success message when success situation', async () => {
      const body: SignUpBodyDTO = {
        username: '테스트맨',
        email: 'testman@gmail.com',
        password: 'testpassword',
      };

      mockLocalUserRepository.insert.mockResolvedValue({
        generatedMaps: [{ id: 4 }],
        identifiers: [
          {
            id: 4,
            isBlock: false,
            createdAt: new Date('2023-03-06T15:01:25.962Z'),
            updatedAt: new Date('2023-03-06T15:01:25.962Z'),
            deletedAt: null,
          },
        ],
        raw: {
          fieldCount: 0,
          affectedRows: 1,
          insertId: 4,
          serverStatus: 2,
          warningCount: 0,
          message: '',
          protocol41: true,
          changedRows: 0,
        },
      });

      expect(service.signUp(body)).resolves.toStrictEqual({
        message: '회원가입 되었습니다.',
      });
    });

    it('should be return fail message when username error situation', () => {
      const { username } = users[0];
      const body: SignUpBodyDTO = {
        username,
        email: 'test5@gmail.com',
        password: 'qwer1234',
      };

      mockUserRepository.findOne.mockResolvedValue(users[0]);

      expect(service.signUp(body)).rejects.toThrowError(
        new BadRequestException({
          message: '해당 닉네임으로 이미 가입한 유저가 존재합니다.',
        })
      );
    });

    it('should be return fail message when error situation', async () => {
      const body: SignUpBodyDTO = {
        email: 'test@gmail.com',
        password: 'testpassword',
      };
      mockLocalUserRepository.insert.mockRejectedValue(new Error());

      expect(service.signUp(body)).rejects.toThrowError(
        new BadRequestException({
          message: '회원가입에 적절하지 않은 이메일과 패스워드입니다.',
        })
      );
    });
  });

  describe('signIn Method', () => {
    it('should be defined', () => {
      expect(service.signIn).toBeDefined();
      expect(typeof service.signIn).toBe('function');
    });

    it('should be return success message when success situation', async () => {
      const body: SignInBodyDTO = {
        email: 'test@gmail.com',
        password: 'testpassword',
      };
      const response: any = {
        cookie: jest.fn(() => response),
      };
      mockLocalUserRepository.findOne.mockResolvedValue(users[0]);
      mockJwtService.sign.mockImplementation((payload: any, options: any) => {
        return `token${options.secret}`;
      });
      const accessToken = `token${mockConfigService.get('JWT_ACCESS_TOKEN_SECRET')}`;
      const refreshToken = `token${mockConfigService.get('JWT_REFRESH_TOKEN_SECRET')}`;

      expect(service.signIn(body, response)).resolves.toStrictEqual({
        message: '로그인 되었습니다.',
        accessToken,
        refreshToken,
      });
    });

    it('should throw NotFoundException when email is not correct', async () => {
      const body: SignInBodyDTO = {
        email: 'fake' + users[0].email,
        password: 'testpassword',
      };
      const response: any = {
        cookie: jest.fn(() => response),
      };
      mockLocalUserRepository.findOne.mockResolvedValue(null);

      expect(service.signIn(body, response)).rejects.toThrowError(
        new NotFoundException({ message: '이메일이나 비밀번호가 일치하지 않습니다.' })
      );
    });

    it('should throw NotFoundException when password is not correct', async () => {
      const body: SignInBodyDTO = {
        email: users[0].email,
        password: 'faketestpassword',
      };
      const response: any = {
        cookie: jest.fn(() => response),
      };
      mockLocalUserRepository.findOne.mockResolvedValue(users[0]);

      expect(service.signIn(body, response)).rejects.toThrowError(
        new NotFoundException({ message: '이메일이나 비밀번호가 일치하지 않습니다.' })
      );
    });

    it('should throw ForbiddenException when user is block', async () => {
      const body: SignInBodyDTO = {
        email: users[2].email,
        password: 'testpassword',
      };
      const response: any = {
        cookie: jest.fn(() => response),
      };
      mockLocalUserRepository.findOne.mockResolvedValue(users[2]);

      expect(service.signIn(body, response)).rejects.toThrowError(
        new ForbiddenException({
          message: '블락된 상태여서 로그인할 수 없습니다.',
        })
      );
    });
  });

  describe('signOut Method', () => {
    it('should be defined', () => {
      expect(service.signOut).toBeDefined();
      expect(typeof service.signOut).toBe('function');
    });

    it('should be return success message when success situation', async () => {
      const user = {
        id: 1,
      };
      const response: any = {
        cookie: jest.fn(() => response),
        clearCookie: jest.fn(() => response),
      };

      expect(service.signOut(user, response)).resolves.toStrictEqual({
        message: '로그아웃 되었습니다.',
      });
    });
  });

  describe('postEmailVerification Method', () => {
    it('should be defined', () => {
      expect(service.postEmailVerification).toBeDefined();
      expect(typeof service.postEmailVerification).toBe('function');
    });

    it('should be return success message when success situation', async () => {
      const body = {
        email: 'test@gmail.com',
      };

      expect(service.postEmailVerification(body)).resolves.toStrictEqual({
        message: '이메일 인증번호가 요청되었습니다.',
      });
    });
  });

  describe('putEmailVerification Method', () => {
    it('should be defined', () => {
      expect(service.putEmailVerification).toBeDefined();
      expect(typeof service.putEmailVerification).toBe('function');
    });

    it('should be return success message when success situation', async () => {
      const body = {
        email: 'test@gmail.com',
        verifyToken: 123456,
      };

      cache = {
        [`${body.email}_verifyToken`]: 123456,
      };

      expect(service.putEmailVerification(body)).resolves.toStrictEqual({
        message: '이메일 인증번호가 확인되었습니다.',
      });
    });

    it('should throw NotFoundException when verifyToken is not cached', async () => {
      const body = {
        email: 'test@gmail.com',
        verifyToken: 123456,
      };

      cache = {};

      expect(service.putEmailVerification(body)).rejects.toThrowError(
        new NotFoundException({
          message: '인증번호를 요청하지 않았거나 만료되었습니다.',
        })
      );
    });

    it('should throw UnauthorizedException when verifyToken is different with cachedVerifyToken', async () => {
      const body = {
        email: 'test@gmail.com',
        verifyToken: 123456,
      };

      cache = {
        [`${body.email}_verifyToken`]: 123458,
      };

      expect(service.putEmailVerification(body)).rejects.toThrowError(
        new UnauthorizedException({
          message: '인증번호가 일치하지 않습니다.',
        })
      );
    });
  });

  describe('changePassword Method', () => {
    it('should be defined', () => {
      expect(service.changePassword).toBeDefined();
      expect(typeof service.changePassword).toBe('function');
    });

    it('should be return success message when success situation', async () => {
      const body = {
        password: 'changePW',
      };
      const user = {
        id: 1,
      };
      cache = {
        'test@gmail.com_verifyToken': 123456,
      };

      expect(service.changePassword(body, user)).resolves.toStrictEqual({
        message: '비밀번호가 변경되었습니다.',
      });
    });
  });

  describe('oauthSignIn Method', () => {
    it('should be defined', () => {
      expect(service.oauthSignIn).toBeDefined();
      expect(typeof service.oauthSignIn).toBe('function');
    });

    it('should be return success message when naver success situation', async () => {
      const provider: 'kakao' | 'naver' = 'naver';
      const body: SocialLoginBodyDTO = {
        code: 'test',
        state: 'chalkak',
      };
      const nickname = 'test-nickname';
      const providerUserId = 1;
      mockUserRepository.findOne.mockResolvedValueOnce(null);
      mockNaverUserRepository.findOne.mockResolvedValue(users[0]);
      mockSocialNaverService.getOauth2Token.mockResolvedValue({ access_token: 'accessToken' });
      mockSocialNaverService.getUserInfo.mockResolvedValue({ id: providerUserId, nickname });
      mockJwtService.sign.mockImplementation((payload: any, options: any) => {
        return `token${options.secret}`;
      });
      const accessToken = `token${mockConfigService.get('JWT_ACCESS_TOKEN_SECRET')}`;
      const refreshToken = `token${mockConfigService.get('JWT_REFRESH_TOKEN_SECRET')}`;

      expect(service.oauthSignIn(provider, body)).resolves.toStrictEqual({
        message: '로그인되었습니다.',
        accessToken,
        refreshToken,
      });
    });

    it('should be return success message when kakao success situation', async () => {
      const provider: 'kakao' | 'naver' = 'kakao';
      const body: SocialLoginBodyDTO = {
        code: 'test',
        state: 'chalkak',
      };
      const nickname = 'test-nickname';
      const providerUserId = 1;
      mockUserRepository.findOne.mockResolvedValueOnce(null);
      mockKakaoUserRepository.findOne.mockResolvedValue(users[0]);
      mockSocialKakaoService.getOauth2Token.mockResolvedValue({ access_token: 'accessToken' });
      mockSocialKakaoService.getUserInfo.mockResolvedValue({ id: providerUserId, kakao_account: { profile: { nickname } } });
      mockJwtService.sign.mockImplementation((payload: any, options: any) => {
        return `token${options.secret}`;
      });
      const accessToken = `token${mockConfigService.get('JWT_ACCESS_TOKEN_SECRET')}`;
      const refreshToken = `token${mockConfigService.get('JWT_REFRESH_TOKEN_SECRET')}`;

      expect(service.oauthSignIn(provider, body)).resolves.toStrictEqual({
        message: '로그인되었습니다.',
        accessToken,
        refreshToken,
      });
    });

    it('should be return success message when username is exist', async () => {
      const provider: 'kakao' | 'naver' = 'naver';
      const body: SocialLoginBodyDTO = {
        code: 'test',
        state: 'chalkak',
      };
      const nickname = users[0].username;
      const providerUserId = 1;
      mockUserRepository.findOne.mockResolvedValueOnce(users[1]);
      mockNaverUserRepository.findOne.mockResolvedValue(users[0]);
      mockSocialNaverService.getOauth2Token.mockResolvedValue({ access_token: 'accessToken' });
      mockSocialNaverService.getUserInfo.mockResolvedValue({ id: providerUserId, nickname });
      mockJwtService.sign.mockImplementation((payload: any, options: any) => {
        return `token${options.secret}`;
      });
      const accessToken = `token${mockConfigService.get('JWT_ACCESS_TOKEN_SECRET')}`;
      const refreshToken = `token${mockConfigService.get('JWT_REFRESH_TOKEN_SECRET')}`;

      expect(service.oauthSignIn(provider, body)).resolves.toStrictEqual({
        message: '로그인되었습니다.',
        accessToken,
        refreshToken,
      });
    });

    it('should be return success message when naver is not signup', async () => {
      const provider: 'kakao' | 'naver' = 'naver';
      const body: SocialLoginBodyDTO = {
        code: 'test',
        state: 'chalkak',
      };
      const nickname = 'test-nickname';
      const providerUserId = 1;
      mockUserRepository.findOne.mockResolvedValueOnce(null);
      mockNaverUserRepository.findOne.mockResolvedValueOnce(null);
      mockNaverUserRepository.findOne.mockResolvedValueOnce(users[0]);
      mockSocialNaverService.getOauth2Token.mockResolvedValue({ access_token: 'accessToken' });
      mockSocialNaverService.getUserInfo.mockResolvedValue({ id: providerUserId, nickname });
      mockJwtService.sign.mockImplementation((payload: any, options: any) => {
        return `token${options.secret}`;
      });
      const accessToken = `token${mockConfigService.get('JWT_ACCESS_TOKEN_SECRET')}`;
      const refreshToken = `token${mockConfigService.get('JWT_REFRESH_TOKEN_SECRET')}`;

      expect(service.oauthSignIn(provider, body)).resolves.toStrictEqual({
        message: '로그인되었습니다.',
        accessToken,
        refreshToken,
      });
    });

    it('should be return success message when kakao is not signup', async () => {
      const provider: 'kakao' | 'naver' = 'kakao';
      const body: SocialLoginBodyDTO = {
        code: 'test',
        state: 'chalkak',
      };
      const nickname = 'test-nickname';
      const providerUserId = 1;
      mockUserRepository.findOne.mockResolvedValueOnce(null);
      mockKakaoUserRepository.findOne.mockResolvedValueOnce(null);
      mockKakaoUserRepository.findOne.mockResolvedValueOnce(users[0]);
      mockSocialKakaoService.getOauth2Token.mockResolvedValue({ access_token: 'accessToken' });
      mockSocialKakaoService.getUserInfo.mockResolvedValue({ id: providerUserId, kakao_account: { profile: { nickname } } });
      mockJwtService.sign.mockImplementation((payload: any, options: any) => {
        return `token${options.secret}`;
      });
      const accessToken = `token${mockConfigService.get('JWT_ACCESS_TOKEN_SECRET')}`;
      const refreshToken = `token${mockConfigService.get('JWT_REFRESH_TOKEN_SECRET')}`;

      expect(service.oauthSignIn(provider, body)).resolves.toStrictEqual({
        message: '로그인되었습니다.',
        accessToken,
        refreshToken,
      });
    });

    
    it('should be return success message when naver insert fail', async () => {
      const provider: 'kakao' | 'naver' = 'naver';
      const body: SocialLoginBodyDTO = {
        code: 'test',
        state: 'chalkak',
      };
      const nickname = 'test-nickname';
      const providerUserId = 1;
      mockUserRepository.findOne.mockResolvedValueOnce(null);
      mockNaverUserRepository.findOne.mockResolvedValueOnce(null);
      mockNaverUserRepository.insert.mockRejectedValue(new Error())
      mockNaverUserRepository.findOne.mockResolvedValueOnce(users[0]);
      mockSocialNaverService.getOauth2Token.mockResolvedValue({ access_token: 'accessToken' });
      mockSocialNaverService.getUserInfo.mockResolvedValue({ id: providerUserId, nickname });
      mockJwtService.sign.mockImplementation((payload: any, options: any) => {
        return `token${options.secret}`;
      });
      const accessToken = `token${mockConfigService.get('JWT_ACCESS_TOKEN_SECRET')}`;
      const refreshToken = `token${mockConfigService.get('JWT_REFRESH_TOKEN_SECRET')}`;

      expect(service.oauthSignIn(provider, body)).rejects.toThrowError( new BadRequestException({
        message: '가입에 실패했습니다.',
      }));
    });

    it('should be return success message when kakao insert fail', async () => {
      const provider: 'kakao' | 'naver' = 'kakao';
      const body: SocialLoginBodyDTO = {
        code: 'test',
        state: 'chalkak',
      };
      const nickname = 'test-nickname';
      const providerUserId = 1;
      mockUserRepository.findOne.mockResolvedValueOnce(null);
      mockKakaoUserRepository.findOne.mockResolvedValueOnce(null);
      mockKakaoUserRepository.insert.mockRejectedValue(new Error())
      mockKakaoUserRepository.findOne.mockResolvedValueOnce(users[0]);
      mockSocialKakaoService.getOauth2Token.mockResolvedValue({ access_token: 'accessToken' });
      mockSocialKakaoService.getUserInfo.mockResolvedValue({ id: providerUserId, kakao_account: { profile: { nickname } } });
      mockJwtService.sign.mockImplementation((payload: any, options: any) => {
        return `token${options.secret}`;
      });
      const accessToken = `token${mockConfigService.get('JWT_ACCESS_TOKEN_SECRET')}`;
      const refreshToken = `token${mockConfigService.get('JWT_REFRESH_TOKEN_SECRET')}`;

      expect(service.oauthSignIn(provider, body)).rejects.toThrowError( new BadRequestException({
        message: '가입에 실패했습니다.',
      }));
    });

    
    it('should be return success message when user is block', async () => {
      const provider: 'kakao' | 'naver' = 'kakao';
      const body: SocialLoginBodyDTO = {
        code: 'test',
        state: 'chalkak',
      };
      const nickname = 'test-nickname';
      const providerUserId = 1;
      mockUserRepository.findOne.mockResolvedValueOnce(null);
      mockKakaoUserRepository.findOne.mockResolvedValueOnce(null);
      mockKakaoUserRepository.findOne.mockResolvedValueOnce(users[2]);
      mockSocialKakaoService.getOauth2Token.mockResolvedValue({ access_token: 'accessToken' });
      mockSocialKakaoService.getUserInfo.mockResolvedValue({ id: providerUserId, kakao_account: { profile: { nickname } } });
      mockJwtService.sign.mockImplementation((payload: any, options: any) => {
        return `token${options.secret}`;
      });
      const accessToken = `token${mockConfigService.get('JWT_ACCESS_TOKEN_SECRET')}`;
      const refreshToken = `token${mockConfigService.get('JWT_REFRESH_TOKEN_SECRET')}`;

      expect(service.oauthSignIn(provider, body)).rejects.toThrowError( new ForbiddenException({
        message: '블락된 상태여서 로그인할 수 없습니다.',
      }));
    });
  });

  describe('refreshAccessToken Method', () => {
    it('should be defined', () => {
      expect(service.refreshAccessToken).toBeDefined();
      expect(typeof service.refreshAccessToken).toBe('function');
    });

    it('should be return success message when success situation', async () => {
      const accessToken = 'accessToken';
      const newAccessToken = 'newAccessToken';
      const refreshToken = 'refreshToken';
      cache = {
        refreshToken: 1,
      };
      mockUserRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'test@gmail.com',
      } as LocalUser);
      mockJwtService.sign.mockReturnValueOnce(newAccessToken);
      mockJwtService.verifyAsync.mockResolvedValue({});

      expect(service.refreshAccessToken(accessToken, refreshToken)).resolves.toStrictEqual({
        accessToken: newAccessToken,
        message: '액세스 토큰을 재발급받았습니다.',
      });
    });

    it('should throw exception when access token is not jwt token and is not signed by chalkak service', async () => {
      const accessToken = 'accessToken';
      const refreshToken = 'refreshToken';
      cache = {};

      mockJwtService.verifyAsync.mockRejectedValue({
        name: 'JsonWebTokenError',
        message: '에러 남',
      });

      expect(service.refreshAccessToken(accessToken, refreshToken)).rejects.toThrowError(
        new UnauthorizedException({
          message: '정상 발급된 액세스 토큰이 아닙니다.',
        })
      );
    });

    it('should throw exception when refresh cache is not found', async () => {
      const accessToken = 'accessToken';
      const refreshToken = 'refreshToken';
      cache = {};
      mockJwtService.verifyAsync.mockResolvedValue({});

      expect(service.refreshAccessToken(accessToken, refreshToken)).rejects.toThrowError(
        new UnauthorizedException({
          message: '사용 만료되었습니다.',
        })
      );
    });

    it('should throw exception when user is not found', async () => {
      const accessToken = 'accessToken';
      const refreshToken = 'refreshToken';
      cache = {
        refreshToken: 1,
      };
      mockJwtService.verifyAsync.mockResolvedValue({});

      expect(service.refreshAccessToken(accessToken, refreshToken)).rejects.toThrowError(
        new NotFoundException({
          message: '탈퇴한 유저입니다.',
        })
      );
    });
  });
});
