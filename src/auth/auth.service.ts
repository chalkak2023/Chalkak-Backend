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
import { LocalUser, KakaoUser, NaverUser, User } from './entities/user.entity';
import {
  PostEmailVerificationBodyDTO,
  SignInBodyDTO,
  SignUpBodyDTO,
  PutEmailVerificationBodyDTO,
  ChangePasswordBodyDTO,
  SocialLoginBodyDTO,
} from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerAuthService } from 'src/mailer/service/mailer.auth.service';
import { Cache } from 'cache-manager';
import _ from 'lodash';
import { SocialNaverService } from '../social/service/social.naver.service';
import { SocialKakaoService } from 'src/social/service/social.kakao.service';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(LocalUser) private localUsersRepository: Repository<LocalUser>,
    @InjectRepository(KakaoUser) private kakaoUsersRepository: Repository<KakaoUser>,
    @InjectRepository(NaverUser) private naverUsersRepository: Repository<NaverUser>,
    @Inject(CACHE_MANAGER) protected readonly cacheManager: Cache,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailerAuthService: MailerAuthService,
    private socialKaKaoService: SocialKakaoService,
    private socialNaverService: SocialNaverService
  ) {}

  async createSampleUser() {
    let arr = [];
    for (let i = 1; i <= 5; i++) {
      const temp = {
        email: `test_emai_${i}@gmail.com`,
        username: `test${i}`,
        password: bcrypt.hashSync('qwer1234', 10),
      };
      arr.push(temp);
    }
    try {
      await this.localUsersRepository.insert(arr);
    } catch (err) {
      throw new BadRequestException({
        message: '????????? ???????????? ?????? ????????????.',
      });
    }

    return {
      message: '?????? ?????? ???????????? ??????????????????.',
    };
  }

  async signUp(body: SignUpBodyDTO) {
    const { username: _username, email, password } = body;
    if (!_.isNil(_username)) {
      const user = await this.usersRepository.findOne({ where: { username: _username } });
      if (!_.isNil(user)) {
        throw new BadRequestException({
          message: '?????? ??????????????? ?????? ????????? ????????? ???????????????.',
        });
      }
    }
    const username = _username || `${email.split('@')[0]}#${Math.floor(Math.random() * 10000) + 1}`;
    const passwordHash = bcrypt.hashSync(password, 10);
    try {
      await this.localUsersRepository.insert({ username, email, password: passwordHash });
    } catch (e) {
      throw new BadRequestException({
        message: '??????????????? ???????????? ?????? ???????????? ?????????????????????.',
      });
    }
    return {
      message: '???????????? ???????????????.',
    };
  }

  async signIn(body: SignInBodyDTO, response: any) {
    const { email, password } = body;
    const user = await this.localUsersRepository.findOne({ where: { email }, select: ['id', 'email', 'username', 'password'] });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new NotFoundException({ message: '??????????????? ??????????????? ???????????? ????????????.' });
    }
    if (user.isBlock) {
      throw new ForbiddenException({
        message: '????????? ???????????? ???????????? ??? ????????????.',
      });
    }
    const accessToken = this.generateUserAccessToken(user);
    const refreshToken = this.generateUserRefreshToken();
    this.cacheManager.set(refreshToken, user.id, { ttl: 1000 * 60 * 60 * 24 * 7 });
    return {
      message: '????????? ???????????????.',
      accessToken,
      refreshToken,
    };
  }

  async signOut(user: any, response: any) {
    await this.cacheManager.del(user.id);
    return {
      message: '???????????? ???????????????.',
    };
  }

  async postEmailVerification(body: PostEmailVerificationBodyDTO) {
    const { email } = body;
    const verifyToken = this.generateRandomNumber();
    await this.mailerAuthService.sendMailAuthMail(email, verifyToken);
    this.cacheManager.set(email + '_verifyToken', verifyToken, { ttl: 1000 * 60 * 5 });
    return {
      message: '????????? ??????????????? ?????????????????????.',
    };
  }

  async putEmailVerification(body: PutEmailVerificationBodyDTO) {
    const { email, verifyToken } = body;
    const cachedVerifyToken = await this.cacheManager.get(email + '_verifyToken');
    if (!cachedVerifyToken) {
      throw new NotFoundException({
        message: '??????????????? ???????????? ???????????? ?????????????????????.',
      });
    }
    if (verifyToken != cachedVerifyToken) {
      throw new UnauthorizedException({
        message: '??????????????? ???????????? ????????????.',
      });
    }
    return {
      message: '????????? ??????????????? ?????????????????????.',
    };
  }

  async changePassword(body: ChangePasswordBodyDTO, user: any) {
    const { password } = body;
    const passwordHash = bcrypt.hashSync(password, 10);
    await this.localUsersRepository.update(user.id, { password: passwordHash });
    return {
      message: '??????????????? ?????????????????????.',
    };
  }

  async oauthSignIn(provider: 'kakao' | 'naver', body: SocialLoginBodyDTO) {
    const socialService = provider === 'kakao' ? this.socialKaKaoService : this.socialNaverService;
    const socialUsersRepository = provider === 'kakao' ? this.kakaoUsersRepository : this.naverUsersRepository;
    const token = await socialService.getOauth2Token(body);
    const info = await socialService.getUserInfo(token.access_token);

    const id = info.id;
    let nickname = provider === 'kakao' ? info.kakao_account.profile.nickname : info.nickname;

    const sameUsernameUser = await this.usersRepository.findOne({
      where: {
        username: nickname,
      },
    });
    if (!_.isNil(sameUsernameUser)) {
      nickname = `${nickname}#${Math.floor(Math.random() * 10000) + 1}`;
    }

    let user = await socialUsersRepository.findOne({
      where: {
        providerUserId: id,
      },
    });
    if (_.isNil(user)) {
      try {
        await socialUsersRepository.insert({
          providerUserId: id,
          username: nickname,
        });
      } catch (err) {
        throw new BadRequestException({
          message: '????????? ??????????????????.',
        });
      }
      user = await socialUsersRepository.findOne({
        where: {
          providerUserId: id,
        },
      });
    }
    if (user!.isBlock) {
      throw new ForbiddenException({
        message: '????????? ???????????? ???????????? ??? ????????????.',
      });
    }

    const accessToken = this.generateUserAccessToken({
      id: user!.id,
      username: user!.username,
    });
    const refreshToken = this.generateUserRefreshToken();
    this.cacheManager.set(refreshToken, user!.id, { ttl: 1000 * 60 * 60 * 24 * 7 });

    return {
      accessToken,
      refreshToken,
      message: '????????????????????????.',
    };
  }

  async refreshAccessToken(accessToken: string, refreshToken: string) {
    try {
      await this.jwtService.verifyAsync(accessToken, {
        secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET') || 'accessToken',
      });
    } catch (err) {
      if (err.name === 'JsonWebTokenError') {
        throw new BadRequestException({
          message: '?????? ????????? ????????? ????????? ????????????.',
        });
      }
    }
    const userId = await this.cacheManager.get<number>(refreshToken);
    if (_.isNil(userId)) {
      throw new UnauthorizedException({
        message: '?????? ?????????????????????.',
      });
    }
    const user = await this.localUsersRepository.findOne({
      where: {
        id: userId,
      },
      select: ['id', 'email'],
    });
    if (_.isNil(user)) {
      throw new NotFoundException({
        message: '????????? ???????????????.',
      });
    }

    const newAccessToken = this.generateUserAccessToken(user);

    return {
      accessToken: newAccessToken,
      message: '????????? ????????? ????????????????????????.',
    };
  }

  private generateRandomNumber(): number {
    var minm = 100000;
    var maxm = 999999;
    return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
  }

  private generateUserAccessToken(user: { id: number; username: string; email?: string }) {
    return this.jwtService.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: 'user',
      },
      {
        secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET') || 'accessToken',
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN') || '1h',
      }
    );
  }

  private generateUserRefreshToken() {
    return this.jwtService.sign(
      {
        random: Math.floor(Math.random() * 10000) + 1,
      },
      {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET') || 'refreshToken',
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN') || '7d',
      }
    );
  }
}
