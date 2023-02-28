import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService
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
    return await this.usersRepository.insert(arr);
  }

  async signUp(body: SignUpBodyDTO) {
    const { email, password } = body;
    const passwordHash = bcrypt.hashSync(password, 10);
    await this.usersRepository.insert({ email, password: passwordHash });
    return {
      message: '회원가입 되었습니다.',
    };
  }

  async signIn(body: SignInBodyDTO, response: any) {
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
        expiresIn: '1h',
      }
    );
    const refreshToken = this.jwtService.sign(
      {
        id: user.id,
      },
      {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET') || 'refreshToken',
        expiresIn: '7d',
      }
    );
    // 임시
    response.cookie('accessToken', accessToken);
    response.cookie('refreshToken', refreshToken);
    return {
      message: '로그인 되었습니다.',
      accessToken,
      refreshToken,
    };
  }

  async signOut(user: any) {
    return {
      message: 'message',
    };
  }

  async postEmailVerification(body: PostEmailVerificationBodyDTO, user: any) {
    const { email } = body;
    return {
      message: 'message',
    };
  }

  async putEmailVerification(body: PutEmailVerificationBodyDTO, user: any) {
    const { email } = body;
    return {
      message: 'message',
    };
  }

  async changePassword(body: ChangePasswordBodyDTO, user: any) {
    const { password } = body;
    return {
      message: 'message',
    };
  }

  async oauthSignIn() {
    return {
      message: 'message',
    };
  }
}
