import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { PostEmailVerificationBodyDTO, SignInBodyDTO, SignUpBodyDTO, PutEmailVerificationBodyDTO, ChangePasswordBodyDTO, SocialLoginBodyDTO, ProviderDTO } from './dto/auth.dto';
import { CACHE_MANAGER } from '@nestjs/common';

const moduleMocker = new ModuleMocker(global);

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  let cache: Record<string, any> = {}

  beforeEach(async () => {
    cache = {};
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker((token) => {
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

    controller = module.get(AuthController);
    service = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /api/auth/signup (signUp)', () => {
    it('should be defined', () => {
      expect(controller.signUp).toBeDefined();
      expect(typeof controller.signUp).toBe('function');
    });

    it('should be return value returned by service same name method', async () => {
      const body: SignUpBodyDTO = {
        username: 'testman',
        email: 'testman@gmail.com',
        password: 'qwer1234',
        verifyToken: 123456,
      };
      const mockReturnValue = { message: '회원가입 되었습니다.' };
      service.signUp.mockResolvedValue(mockReturnValue);

      expect(controller.signUp(body)).resolves.toBe(mockReturnValue);
    });
  });

  describe('POST /api/auth/signup (signUp)', () => {
    it('should be defined', () => {
      expect(controller.signUp).toBeDefined();
      expect(typeof controller.signUp).toBe('function');
    });

    it('should be return value returned by service same name method', async () => {
      const body: SignUpBodyDTO = {
        username: 'testman',
        email: 'testman@gmail.com',
        password: 'qwer1234',
        verifyToken: 123456,
      };
      const mockReturnValue = { message: '회원가입 되었습니다.' };
      service.signUp.mockResolvedValue(mockReturnValue);

      expect(controller.signUp(body)).resolves.toBe(mockReturnValue);
    });
  });

  describe('POST /api/auth/signIn (signIn)', () => {
    it('should be defined', () => {
      expect(controller.signIn).toBeDefined();
      expect(typeof controller.signIn).toBe('function');
    });

    it('should be return value returned by service same name method', async () => {
      const body: SignInBodyDTO = {
        email: 'testman@gmail.com',
        password: 'qwer1234',
      };
      
      const mockReturnValue = { message: '로그인 되었습니다.', accessToken: 'accessToken', refreshToken: 'refreshToken' };
      service.signIn.mockResolvedValue(mockReturnValue);

      expect(controller.signIn(body)).resolves.toBe(mockReturnValue);
    });
  });

  describe('POST /api/auth/signout (signOut)', () => {
    it('should be defined', () => {
      expect(controller.signOut).toBeDefined();
      expect(typeof controller.signOut).toBe('function');
    });

    it('should be return value returned by service same name method', async () => {
      const user = {
        id: 1,
        username: 'testman',
        email: 'test@gmail.com',
        role: 'member',
        iat: 1000,
        exp: 1001,
      };
      
      const mockReturnValue = { message: '로그아웃 되었습니다.' };
      service.signOut.mockResolvedValue(mockReturnValue);

      expect(controller.signOut(user)).resolves.toBe(mockReturnValue);
    });
  });

  describe('POST /api/auth/emailVerification (postEmailVerification)', () => {
    it('should be defined', () => {
      expect(controller.postSignupEmailVerification).toBeDefined();
      expect(typeof controller.postSignupEmailVerification).toBe('function');
    });

    it('should be return value returned by service same name method', async () => {
      const body: PostEmailVerificationBodyDTO = {
        email: 'testman@gmail.com',
      };
      const mockReturnValue = { message: '이메일 인증번호가 요청되었습니다.' };
      service.postSignupEmailVerification.mockResolvedValue(mockReturnValue);

      expect(controller.postSignupEmailVerification(body)).resolves.toBe(mockReturnValue);
    });
  });

  describe('PUT /api/auth/emailVerification (putEmailVerification)', () => {
    it('should be defined', () => {
      expect(controller.putSignupEmailVerification).toBeDefined();
      expect(typeof controller.putSignupEmailVerification).toBe('function');
    });

    it('should be return value returned by service same name method', async () => {
      const body: PutEmailVerificationBodyDTO = {
        email: 'testman@gmail.com',
        verifyToken: 123456,
      };
      const mockReturnValue = { message: '이메일 인증번호가 확인되었습니다.' };
      service.putSignupEmailVerification.mockResolvedValue(mockReturnValue);

      expect(controller.putSignupEmailVerification(body)).resolves.toBe(mockReturnValue);
    });
  });

  describe('PATCH /api/auth (changePassword)', () => {
    it('should be defined', () => {
      expect(controller.changePassword).toBeDefined();
      expect(typeof controller.changePassword).toBe('function');
    });

    it('should be return value returned by service same name method', async () => {
      const body: ChangePasswordBodyDTO = {
        password: 'changepassword1234',
      };
      const user = {
        id: 1,
        username: 'testman',
        email: 'test@gmail.com',
        role: 'member',
        iat: 1000,
        exp: 1001,
      };
      const mockReturnValue = { message: '비밀번호가 변경되었습니다.' };
      service.changePassword.mockResolvedValue(mockReturnValue);

      expect(controller.changePassword(body, user)).resolves.toBe(mockReturnValue);
    });
  });

  describe('POST /api/oauth/signin/:provider (oauthSignIn)', () => {
    it('should be defined', () => {
      expect(controller.oauthSignIn).toBeDefined();
      expect(typeof controller.oauthSignIn).toBe('function');
    });

    it('should be return value returned by service same name method', async () => {
      const params: ProviderDTO = {
        provider: 'kakao'
      }
      const body: SocialLoginBodyDTO = {
        code: 'test',
        state: 'chalkak'
      };
      const mockReturnValue = { accessToken: 'accessToken', refreshToken: 'refreshToken', message: '로그인되었습니다.' };
      service.oauthSignIn.mockResolvedValue(mockReturnValue);

      expect(controller.oauthSignIn(params, body)).resolves.toBe(mockReturnValue);
    });
  });


  describe('GET /api/auth/refresh (refreshAccessToken)', () => {
    it('should be defined', () => {
      expect(controller.refreshAccessToken).toBeDefined();
      expect(typeof controller.refreshAccessToken).toBe('function');
    });

    it('should be return value returned by service same name method', async () => {
      const accessToken = 'accessToken';
      const newAccessToken = 'AccessToken';
      const refreshToken = 'refreshToken';

      const mockReturnValue = {
        accessToken: newAccessToken,
        message: '액세스 토큰을 재발급받았습니다.',
      };
      service.refreshAccessToken.mockResolvedValue(mockReturnValue);

      expect(controller.refreshAccessToken(accessToken, refreshToken)).resolves.toBe(mockReturnValue);
    });
  });
});
