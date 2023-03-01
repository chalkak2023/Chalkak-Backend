import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerAuthService } from 'src/mailer/service/mailer.auth.service';
import { BadRequestException, CACHE_MANAGER } from '@nestjs/common';
import { SignUpBodyDTO } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { isArray } from 'class-validator';
import { Response } from 'express';
jest.mock('bcrypt');

type TableUser = Omit<User, 'collections' | 'photospots' | 'meetups' | 'joins'>;

const moduleMocker = new ModuleMocker(global);

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository: jest.Mocked<Repository<User>>;
  let mockJwtService: jest.Mocked<JwtService>;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockMailerAuthService: jest.Mocked<MailerAuthService>;

  // DB 모킹
  let users: TableUser[] = [];
  // 캐시(레디스 등) 모킹
  let cache: Record<string, any> = {};

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
  });

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
          };
        }
        if (token === CACHE_MANAGER) {
          return {
            get: jest.fn().mockImplementation((key: string) => cache[key]),
            set: jest.fn().mockImplementation((key: string, value: any, options: any) => (cache[key] = value)),
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
    mockJwtService = module.get(JwtService);
    mockConfigService = module.get(ConfigService);
    mockMailerAuthService = module.get(MailerAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
