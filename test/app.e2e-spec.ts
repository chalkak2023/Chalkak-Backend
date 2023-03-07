import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
// import * as request from 'supertest';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { decodedAccessTokenDTO, SignInBodyDTO, SignUpBodyDTO } from 'src/auth/dto/auth.dto';
import { Connection } from 'typeorm';
import { CreateMeetupDTO } from 'src/meetups/dto/create-meetup.dto';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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

  describe('auth', () => {
    describe('POST /api/auth/signup - 회원가입', () => {
      it('Success', () => {
        const signupBodyDTO: SignUpBodyDTO = {
          email: 'test@gmail.com',
          password: 'qwer1234',
        }
        return request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(signupBodyDTO)
        .expect(201).expect({
          message: '회원가입 되었습니다.',
        });
      });
      it('Fail - Bad Request', () => {
        const signupBodyDTO: Object = {
          email: 'test@gmail.com',
          password: 'qwer1234',
          wrong: 'wrong',
        }
        return request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(signupBodyDTO)
        .expect(400);
      });
    });

    describe('POST /api/auth/signin - 로그인', () => {
      it('Success', () => {
        const signinBodyDTO: SignInBodyDTO = {
          email: 'test@gmail.com',
          password: 'qwer1234',
        }
        return request(app.getHttpServer())
        .post('/api/auth/signin')
        .send(signinBodyDTO)
        .expect(200);
      });
      it('Fail - Not signup email', () => {
        const signinBodyDTO: SignInBodyDTO = {
          email: 'wrong@gmail.com',
          password: 'qwer1234',
        }
        return request(app.getHttpServer())
        .post('/api/auth/signin')
        .send(signinBodyDTO)
        .expect(404)
        .expect({
          message: '가입하지 않은 이메일입니다.',
        });
      });
      it('Fail - Wrong password', () => {
        const signinBodyDTO: SignInBodyDTO = {
          email: 'test@gmail.com',
          password: 'wrong_pw',
        }
        return request(app.getHttpServer())
        .post('/api/auth/signin')
        .send(signinBodyDTO)
        .expect(401)
        .expect({
          message: '비밀번호가 일치하지 않습니다.',
        });
      });
    });
  });

  describe('meetups', () => {
    describe('GET /api/meetups - 모임 목록 조회', () => {
      it('Success', () => {
        return request(app.getHttpServer())
        .get('/api/meetups')
        .expect(200)
        .expect([]);
      });
    });
    // describe('POST /api/meetups - 모임 등록', () => {
    //   it('Success', () => {
    //     const meetupDTO: CreateMeetupDTO = {
    //       title: 'title',
    //       content: 'content',
    //       place: 'place',
    //       schedule: '2023-03-02 20:00',
    //       headcount: 2
    //     }
    //     const userDTO: decodedAccessTokenDTO = {
    //       id: 1,
    //       username: '',
    //       role: 'user',
    //       iat: 0,
    //       exp: 0
    //     }
    //     return request(app.getHttpServer())
    //     .post('/api/meetups')
    //     .send(meetupDTO)
    //     .set('Cookie', [  // TODO: 로그인 인증하는 과정에서 해결 못함.
    //       'accessToken=accessToken', 
    //       'refreshToken=refreshToken' 
    //     ])
    //     .expect(201);
    //   });
    // });
  });
});
