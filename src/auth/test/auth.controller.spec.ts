import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { CACHE_MANAGER } from '@nestjs/common';
import { ChangePasswordBodyDTO, decodedAccessTokenDTO, SendEmailForSignupBodyDTO, ProviderDTO, VerifyEmailForChangePasswordBodyDTO, VerifyEmailForSignupBodyDTO, SignInBodyDTO, SignUpBodyDTO, SocialLoginBodyDTO } from '../dto/auth.dto';
import { LocalUser } from '../entities/user.entity';

const moduleMocker = new ModuleMocker(global);

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker((token) => {
        if (token === CACHE_MANAGER) {
          return {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
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
      const user: LocalUser = {
        id: 1,
        email: 'testman@gmail.com',
        password: 'qwer1234',
        isBlock : false,
      } as LocalUser
      
      const mockReturnValue = { message: '로그인 되었습니다.', accessToken: 'accessToken', refreshToken: 'refreshToken' };
      service.signIn.mockResolvedValue(mockReturnValue);

      expect(controller.signIn(user)).resolves.toBe(mockReturnValue);
    });
  });

  describe('POST /api/auth/signout (signOut)', () => {
    it('should be defined', () => {
      expect(controller.signOut).toBeDefined();
      expect(typeof controller.signOut).toBe('function');
    });

    it('should be return value returned by service same name method', async () => {
      const refreshToken = 'token';
      const mockReturnValue = { message: '로그아웃 되었습니다.' };
      service.signOut.mockResolvedValue(mockReturnValue);

      expect(controller.signOut(refreshToken)).resolves.toBe(mockReturnValue);
    });
  });

  describe('POST /api/auth/emailVerification (postEmailVerification)', () => {
    it('should be defined', () => {
      expect(controller.SendEmailForSignup).toBeDefined();
      expect(typeof controller.SendEmailForSignup).toBe('function');
    });

    it('should be return value returned by service same name method', async () => {
      const body: SendEmailForSignupBodyDTO = {
        email: 'testman@gmail.com',
      };
      const mockReturnValue = { message: '회원가입 이메일 인증번호가 요청되었습니다.' };
      service.SendEmailForSignup.mockResolvedValue(mockReturnValue);

      expect(controller.SendEmailForSignup(body)).resolves.toBe(mockReturnValue);
    });
  });

  describe('PUT /api/auth/emailVerification (putEmailVerification)', () => {
    it('should be defined', () => {
      expect(controller.VerifyEmailForSignup).toBeDefined();
      expect(typeof controller.VerifyEmailForSignup).toBe('function');
    });

    it('should be return value returned by service same name method', async () => {
      const body: VerifyEmailForSignupBodyDTO = {
        email: 'testman@gmail.com',
        verifyToken: 123456,
      };
      const mockReturnValue = { message: '회원가입 이메일 인증번호가 확인되었습니다.' };
      service.VerifyEmailForSignup.mockResolvedValue(mockReturnValue);

      expect(controller.VerifyEmailForSignup(body)).resolves.toBe(mockReturnValue);
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

  describe('POST /api/auth/emailVerification/password (postChangePasswordEmailVerification)', () => {
    it('should be defined', () => {
      expect(controller.postChangePasswordEmailVerification).toBeDefined();
      expect(typeof controller.postChangePasswordEmailVerification).toBe('function');
    });

    it('should be return value returned by service same name method', async () => {
      const decodedPayload: decodedAccessTokenDTO = {
        email: 'testman@gmail.com'
      } as decodedAccessTokenDTO;
      const mockReturnValue = { message: '패스워드변경 이메일 인증번호가 요청되었습니다.' };
      service.postChangePasswordEmailVerification.mockResolvedValue(mockReturnValue);

      expect(controller.postChangePasswordEmailVerification(decodedPayload)).resolves.toBe(mockReturnValue);
    });
  });

  describe('PUT /api/auth/emailVerification/password (verifyEmailForChangePassword)', () => {
    it('should be defined', () => {
      expect(controller.verifyEmailForChangePassword).toBeDefined();
      expect(typeof controller.verifyEmailForChangePassword).toBe('function');
    });

    it('should be return value returned by service same name method', async () => {
      const body: VerifyEmailForChangePasswordBodyDTO = {
        verifyToken: 123456,
      };
      const decodedPayload: decodedAccessTokenDTO = {
        email: 'testman@gmail.com'
      } as decodedAccessTokenDTO;

      const mockReturnValue = { message: '패스워드변경 이메일 인증번호가 확인되었습니다.' };
      service.verifyEmailForChangePassword.mockResolvedValue(mockReturnValue);

      expect(controller.verifyEmailForChangePassword(body, decodedPayload)).resolves.toBe(mockReturnValue);
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


  describe('GET /api/auth/refresh (renewAccessToken)', () => {
    it('should be defined', () => {
      expect(controller.renewAccessToken).toBeDefined();
      expect(typeof controller.renewAccessToken).toBe('function');
    });

    it('should be return value returned by service same name method', async () => {
      const accessToken = 'accessToken';
      const newAccessToken = 'AccessToken';
      const refreshToken = 'refreshToken';

      const mockReturnValue = {
        accessToken: newAccessToken,
        message: '액세스 토큰을 재발급받았습니다.',
      };
      service.renewAccessToken.mockResolvedValue(mockReturnValue);

      expect(controller.renewAccessToken(accessToken, refreshToken)).resolves.toBe(mockReturnValue);
    });
  });
});
