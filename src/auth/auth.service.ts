import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import {
  PostEmailVerificationBodyDTO,
  SignInBodyDTO,
  SignUpBodyDTO,
  PutEmailVerificationBodyDTO,
  ChangePasswordBodyDTO,
} from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerAuthService } from 'src/mailer/service/mailer.auth.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @Inject(CACHE_MANAGER) protected readonly cacheManager: any,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailerAuthService: MailerAuthService
  ) {}

  async createSampleUser() {
    let arr = [];
    for (let i = 1; i <= 5; i++) {
      const temp = {
        email: `test_emai_${i}@gmail.com`,
        password: bcrypt.hashSync('qwer1234', 10),
      };
      arr.push(temp);
    }
    return await this.usersRepository.insert(arr).catch((err) => {
      throw new BadRequestException({
        message: '중복된 데이터가 이미 있습니다.',
      });
    });
  }

  async signUp(body: SignUpBodyDTO) {
    const { email, password } = body;
    const passwordHash = bcrypt.hashSync(password, 10);
    await this.usersRepository.insert({ email, password: passwordHash }).catch((err) => {
      throw new BadRequestException({
        message: '회원가입에 적절하지 않은 이메일과 패스워드입니다.',
      });
    });
    return {
      message: '회원가입 되었습니다.',
    };
  }

  async signIn(body: SignInBodyDTO, response: any) {
    try {
      const { email, password } = body;
      const user = await this.usersRepository.findOneBy({ email });
      if (!user) {
        throw new NotFoundException({ message: '가입하지 않은 이메일입니다.' });
      }
      if (!bcrypt.compareSync(password, user.password)) {
        throw new UnauthorizedException({ message: '비밀번호가 일치하지 않습니다.' });
      }
      const accessToken = this.jwtService.sign(
        {
          id: user.id,
          email: user.email,
          role: 'user',
        },
        {
          secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET') || 'accessToken',
          expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN') || '1h',
        }
      );
      const refreshToken = this.jwtService.sign(
        {
          id: user.id,
        },
        {
          secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET') || 'refreshToken',
          expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN') || '7d',
        }
      );
      this.cacheManager.set(user.id, refreshToken, { ttl: 1000 * 60 * 60 * 24 * 7 });
      // 임시
      response.cookie('accessToken', accessToken, { maxAge: 1000 * 60 * 60 });
      response.cookie('refreshToken', refreshToken, { maxAge: 1000 * 60 * 60 * 24 * 7 });
      return {
        message: '로그인 되었습니다.',
        accessToken,
        refreshToken,
      };
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException({
        message: '로그인이 제대로 이뤄지지 않았습니다.',
      });
    }
  }

  async signOut(user: any, response: any) {
    await this.cacheManager.del(user.id);
    // 임시
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
    return {
      message: '로그아웃 되었습니다.',
    };
  }

  async postEmailVerification(body: PostEmailVerificationBodyDTO) {
    const { email } = body;
    const verifyToken = this.generateRandomNumber();
    await this.mailerAuthService.sendMailAuthMail(email, verifyToken);
    this.cacheManager.set(email + '_verifyToken', verifyToken, { ttl: 1000 * 60 * 5 });
    return {
      message: '이메일 인증번호가 요청되었습니다.',
    };
  }

  async putEmailVerification(body: PutEmailVerificationBodyDTO) {
    const { email, verifyToken } = body;
    const cachedVerifyToken = await this.cacheManager.get(email + '_verifyToken');
    console.log(verifyToken, cachedVerifyToken);
    if (!cachedVerifyToken) {
      throw new NotFoundException({
        message: '인증번호를 요청하지 않았거나 만료되었습니다.',
      });
    }
    if (verifyToken != cachedVerifyToken) {
      throw new UnauthorizedException({
        message: '인증번호가 일치하지 않습니다.',
      });
    }
    return {
      message: '이메일 인증번호가 확인되었습니다.',
    };
  }

  async changePassword(body: ChangePasswordBodyDTO, user: any) {
    const { password } = body;
    const passwordHash = bcrypt.hashSync(password, 10);
    await this.usersRepository.update(user.id, { password: passwordHash });
    return {
      message: '비밀번호가 변경되었습니다.',
    };
  }

  async oauthSignIn() {
    return {
      message: 'message',
    };
  }

  private generateRandomNumber(): number {
    var minm = 100000;
    var maxm = 999999;
    return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
  }
}
