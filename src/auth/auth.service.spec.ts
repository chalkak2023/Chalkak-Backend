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
