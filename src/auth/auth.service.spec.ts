import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerAuthService } from 'src/mailer/service/mailer.auth.service';
import { CACHE_MANAGER } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
jest.mock('bcrypt');


const moduleMocker = new ModuleMocker(global);

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository: jest.Mocked<Repository<User>>;
  let mockJwtService: jest.Mocked<JwtService>;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockMailerAuthService: jest.Mocked<MailerAuthService>;

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
  })

  beforeEach(() => {
    // 데이터셋
    users = [
      {
        id: 1,
        email: 'test@gmail.com',
        password: 'testpassword|10',
        isBlock: false,
        createdAt: new Date('2023-02-28T13:46:54.285Z'),
        updatedAt: new Date('2023-02-28T13:49:32.285Z'),
        deletedAt: null,
      },
      {
        id: 2,
        email: 'test@naver.com',
        password: 'testpass|10',
        isBlock: false,
        createdAt: new Date('2023-02-28T13:50:22.225Z'),
        updatedAt: new Date('2023-02-28T13:50:32.144Z'),
        deletedAt: new Date('2023-02-28T13:53:03.387Z'),
      },
    ];
  });

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    })
      .useMocker((token) => {
        if (token === getRepositoryToken(User)) {
          return {
            
          };
        }
        if (token === CACHE_MANAGER) {
          return {

          }
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
    mockJwtService = module.get(JwtService);
    mockConfigService = module.get(ConfigService);
    mockMailerAuthService = module.get(MailerAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
