import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
// import * as request from 'supertest';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import cookieParser from 'cookie-parser';
import { SignUpBodyDTO } from 'src/auth/dto/auth.dto';
import { Connection } from 'typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableCors({
      origin: true,
      credentials: true,
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    app.use(cookieParser());
    const connection = app.get(Connection);
    await connection.synchronize(true);
    await app.init();
  });

  afterAll(async () => {
    const connection = app.get(Connection);
    await connection.synchronize(true);
    app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Chalkak');
  });

  describe('/api/auth', () => {
    const signupBodyDTO: SignUpBodyDTO = {
      email: 'test@gmail.com',
      password: 'qwer1234',
    }
    it('POST 201', () => {
      return request(app.getHttpServer())
      .post('/api/auth/signup')
      .send(signupBodyDTO)
      .expect(201).expect({
        message: '회원가입 되었습니다.',
      });
    });
  });

  describe('/api/meetups', () => {
    it('GET 200', () => {
      // localhost:3000 안쓰기 위해 app.getHttpServer() 시용
      return request(app.getHttpServer())
      .get('/api/meetups')
      .expect(200)
      .expect([]);
    });
  });
});
