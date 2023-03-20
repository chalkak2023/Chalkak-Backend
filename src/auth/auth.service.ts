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
  decodedAccessTokenDTO,
  PutChangePasswordVerificationBodyDTO,
} from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerAuthService } from 'src/mailer/service/mailer.auth.service';
import { Cache } from 'cache-manager';
import _, { isNil } from 'lodash';
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

  async signUp(body: SignUpBodyDTO) {
    const { username, email, password, verifyToken } = body;
    const cachedVerifyToken = await this.cacheManager.get(email + '_signup');
    if (!cachedVerifyToken) {
      throw new NotFoundException({
        message: '인증번호를 요청하지 않았거나 만료되었습니다.',
      });
    }
    if (verifyToken != cachedVerifyToken) {
      throw new BadRequestException({
        message: '인증번호가 일치하지 않습니다.',
      });
    }
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!_.isNil(user)) {
      throw new BadRequestException({
        message: '해당 닉네임으로 이미 가입한 유저가 존재합니다.',
      });
    }
    const passwordHash = bcrypt.hashSync(password, 10);
    try {
      await this.localUsersRepository.insert({ username, email, password: passwordHash });
    } catch (e) {
      throw new BadRequestException({
        message: '회원가입에 적절하지 않은 이메일과 패스워드입니다.',
      });
    }
    return {
      message: '회원가입 되었습니다.',
    };
  }

  async validateLocalUser(email: string, password: string) {
    const user = await this.localUsersRepository.findOne({ where: { email }, select: ['id', 'email', 'username', 'password', 'isBlock'] });
    if (_.isNil(user) || !bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException({ message: '이메일이나 비밀번호가 일치하지 않습니다.' });
    }
    return user;
  }

  async signIn(user: LocalUser) {
    const accessToken = this.generateUserAccessToken(user);
    const refreshToken = this.generateUserRefreshToken();
    this.cacheManager.set(refreshToken, user.id, { ttl: 60 * 60 * 3 });
    return {
      message: '로그인 되었습니다.',
      accessToken,
      refreshToken,
    };
  }

  async signOut(user: decodedAccessTokenDTO) {
    await this.cacheManager.del(String(user.id));
    return {
      message: '로그아웃 되었습니다.',
    };
  }

  async postSignupEmailVerification(body: PostEmailVerificationBodyDTO) {
    const { email } = body;
    const user = await this.localUsersRepository.findOne({where: { email }})
    if (!_.isNil(user)) {
      throw new BadRequestException({
        message: '이미 가입된 이메일입니다.'
      })
    }
    const verifyToken = this.generateRandomNumber();
    await this.mailerAuthService.sendSignupAuthMail(email, verifyToken);
    this.cacheManager.set(email + '_signup', verifyToken, { ttl: 60 * 5 });
    return {
      message: '회원가입 이메일 인증번호가 요청되었습니다.',
    };
  }

  async putSignupEmailVerification(body: PutEmailVerificationBodyDTO) {
    const { email, verifyToken } = body;
    const cachedVerifyToken = await this.cacheManager.get(email + '_signup');
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
      message: '회원가입 이메일 인증번호가 확인되었습니다.',
    };
  }

  async changePassword(body: ChangePasswordBodyDTO, user: decodedAccessTokenDTO) {
    const { password } = body;
    const passwordHash = bcrypt.hashSync(password, 10);
    await this.localUsersRepository.update(user.id, { password: passwordHash });
    return {
      message: '비밀번호가 변경되었습니다.',
    };
  }
  
  async postChangePasswordEmailVerification(user: decodedAccessTokenDTO) {
    const { email } = user;
    if (isNil(email)) {
      throw new BadRequestException({
        message: '이메일, 패스워드로 가입한 유저가 아닙니다.'
      })
    }
    const verifyToken = this.generateRandomNumber();
    await this.mailerAuthService.sendChangePasswordAuthMail(email, verifyToken);
    this.cacheManager.set(email + '_changePassword', verifyToken, { ttl: 60 * 5 });
    return {
      message: '패스워드변경 이메일 인증번호가 요청되었습니다.',
    };
  }

  async putChangePasswordEmailVerification(body: PutChangePasswordVerificationBodyDTO, user: decodedAccessTokenDTO) {
    const { verifyToken } = body;
    const { email } = user;
    if (isNil(email)) {
      throw new BadRequestException({
        message: '이메일, 패스워드로 가입한 유저가 아닙니다.'
      })
    }
    const cachedVerifyToken = await this.cacheManager.get(email + '_changePassword');
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
      message: '패스워드변경 이메일 인증번호가 확인되었습니다.',
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
          message: '가입에 실패했습니다.',
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
        message: '블락된 상태여서 로그인할 수 없습니다.',
      });
    }

    const accessToken = this.generateUserAccessToken({
      id: user!.id,
      username: user!.username,
    });
    const refreshToken = this.generateUserRefreshToken();
    this.cacheManager.set(refreshToken, user!.id, { ttl: 60 * 60 * 3 });

    return {
      accessToken,
      refreshToken,
      message: '로그인되었습니다.',
    };
  }

  async refreshAccessToken(accessToken: string, refreshToken: string) {
    try {
      await this.jwtService.verifyAsync(accessToken, {
        secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      });
    } catch (err) {
      if (err.name === 'JsonWebTokenError') {
        throw new BadRequestException({
          message: '정상 발급된 액세스 토큰이 아닙니다.',
        });
      }
    }
    const userId = await this.cacheManager.get<number>(refreshToken);
    if (_.isNil(userId)) {
      throw new UnauthorizedException({
        message: '사용 만료되었습니다.',
      });
    }
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
      select: ['id', 'email'],
    });
    if (_.isNil(user)) {
      throw new NotFoundException({
        message: '탈퇴한 유저입니다.',
      });
    }

    const newAccessToken = this.generateUserAccessToken(user);
    this.cacheManager.set(refreshToken, userId, {
      ttl: 60 * 60 * 3
    })

    return {
      accessToken: newAccessToken,
      message: '액세스 토큰을 재발급받았습니다.',
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
        secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
      }
    );
  }

  private generateUserRefreshToken() {
    return this.jwtService.sign(
      {
        random: Math.floor(Math.random() * 10000) + 1,
      },
      {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN'),
      }
    );
  }
}
