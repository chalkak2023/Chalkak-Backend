import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocalUser, KakaoUser, NaverUser, User } from './entities/user.entity';
import {
  PostEmailVerificationBodyDTO,
  SignUpBodyDTO,
  PutEmailVerificationBodyDTO,
  ChangePasswordBodyDTO,
  SocialLoginBodyDTO,
  decodedAccessTokenDTO,
  PutChangePasswordVerificationBodyDTO,
} from './dto/auth.dto';
import { MailerAuthService } from 'src/mailer/service/mailer.auth.service';
import _ from 'lodash';
import { ForbiddenException } from '@nestjs/common';
import { AuthJwtService } from './service/auth.jwt.service';
import { AuthCacheService } from './service/auth.cache.service';
import { SocialService } from 'src/social/service/social.service';
import { AuthHashService } from './service/auth.hash.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(LocalUser) private localUsersRepository: Repository<LocalUser>,
    @InjectRepository(KakaoUser) private kakaoUsersRepository: Repository<KakaoUser>,
    @InjectRepository(NaverUser) private naverUsersRepository: Repository<NaverUser>,
    private authCacheService: AuthCacheService,
    private authHashService: AuthHashService,
    private authJwtService: AuthJwtService,
    private mailerAuthService: MailerAuthService,
    private socialService: SocialService,
  ) {}

  async signUp(body: SignUpBodyDTO) {
    const { username, email, password, verifyToken } = body;
    const cachedVerifyToken = await this.authCacheService.getVerifyToken('signup', email);
    if (_.isNil(cachedVerifyToken)) {
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
    const passwordHash = this.authHashService.hashPassword(password);
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
    if (_.isNil(user) || !this.authHashService.comparePassword(password, user.password)) {
      throw new UnauthorizedException({ message: '이메일이나 비밀번호가 일치하지 않습니다.' });
    }
    if (user.isBlock) {
      throw new ForbiddenException({ message: '블락된 유저는 로그인을 할 수 없습니다.'})
    }
    return user;
  }

  async signIn(user: LocalUser) {
    const accessToken = this.authJwtService.generateUserAccessToken(user);
    const refreshToken = this.authJwtService.generateUserRefreshToken();
    this.authCacheService.storeRefreshToken(refreshToken, user.id);
    return {
      message: '로그인 되었습니다.',
      accessToken,
      refreshToken,
    };
  }

  async signOut(refreshToken: string) {
    await this.authCacheService.deleteRefreshToken(refreshToken);
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
    this.authCacheService.storeVerifyToken('signup', email, verifyToken);
    return {
      message: '회원가입 이메일 인증번호가 요청되었습니다.',
    };
  }

  async putSignupEmailVerification(body: PutEmailVerificationBodyDTO) {
    const { email, verifyToken } = body;
    
    const cachedVerifyToken = await this.authCacheService.getVerifyToken('signup', email);
    if (_.isNil(cachedVerifyToken)) {
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
    const passwordHash = this.authHashService.hashPassword(password);
    await this.localUsersRepository.update(user.id, { password: passwordHash });
    return {
      message: '비밀번호가 변경되었습니다.',
    };
  }
  
  async postChangePasswordEmailVerification(user: decodedAccessTokenDTO) {
    const { email } = user;
    if (_.isNil(email)) {
      throw new BadRequestException({
        message: '이메일, 패스워드로 가입한 유저가 아닙니다.'
      })
    }
    const verifyToken = this.generateRandomNumber();
    await this.mailerAuthService.sendChangePasswordAuthMail(email, verifyToken);
    this.authCacheService.storeVerifyToken('changePassword', email, verifyToken);
    return {
      message: '패스워드변경 이메일 인증번호가 요청되었습니다.',
    };
  }

  async putChangePasswordEmailVerification(body: PutChangePasswordVerificationBodyDTO, user: decodedAccessTokenDTO) {
    const { verifyToken } = body;
    const { email } = user;
    if (_.isNil(email)) {
      throw new BadRequestException({
        message: '이메일, 패스워드로 가입한 유저가 아닙니다.'
      })
    }
    const cachedVerifyToken = await this.authCacheService.getVerifyToken('changePassword', email);
    if (_.isNil(cachedVerifyToken)) {
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
    const socialUsersRepository = provider === 'kakao' ? this.kakaoUsersRepository : this.naverUsersRepository;
    const { accessToken: socialAccessToken, providerUserId, username: _username } = await this.socialService.validateSocialUser(provider, body);
    let username = _username;

    const sameUsernameUser = await this.usersRepository.findOne({
      where: {
        username,
      },
    });
    if (!_.isNil(sameUsernameUser)) {
      username = `${username}#${Math.floor(Math.random() * 10000) + 1}`;
    }

    let user = await socialUsersRepository.findOne({
      where: {
        providerUserId,
      },
    });
    if (_.isNil(user)) {
      try {
        await socialUsersRepository.insert({
          providerUserId,
          username,
        });
      } catch (err) {
        throw new BadRequestException({
          message: '가입에 실패했습니다.',
        });
      }
      user = await socialUsersRepository.findOne({
        where: {
          providerUserId,
        },
      });
    }
    if (_.isNil(user)) {
      return ;
    }
    if (user.isBlock) {
      throw new ForbiddenException({
        message: '블락된 상태여서 로그인할 수 없습니다.',
      });
    }

    const accessToken = this.authJwtService.generateUserAccessToken(user);
    const refreshToken = this.authJwtService.generateUserRefreshToken();
    this.authCacheService.storeRefreshToken(refreshToken, user.id);

    return {
      accessToken,
      refreshToken,
      message: '로그인되었습니다.',
    };
  }

  async refreshAccessToken(accessToken: string, refreshToken: string) {
    await this.authJwtService.verifyUserAccessTokenWithoutExpiresIn(accessToken);
    const userId = await this.authCacheService.getUserIdByRefreshToken(refreshToken);
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

    const newAccessToken = this.authJwtService.generateUserAccessToken(user);
    this.authCacheService.storeRefreshToken(refreshToken, userId);

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
}
