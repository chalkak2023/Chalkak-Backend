import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
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
  PostResetPasswordEmailVerificationBodyDTO,
  PutResetPasswordEmailVerificationBodyDTO,
} from './dto/auth.dto';
import { MailerAuthService } from 'src/mailer/services/mailer.auth.service';
import _ from 'lodash';
import { ForbiddenException } from '@nestjs/common';
import { AuthJwtService } from './services/auth.jwt.service';
import { AuthCacheService } from './services/auth.cache.service';
import { SocialService } from 'src/social/services/social.service';
import { AuthHashService } from './services/auth.hash.service';

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
    const registeredUser = await this.localUsersRepository.findOne({ where: { email } });
    if (!_.isNil(registeredUser)) {
      throw new ConflictException({
        message: '이미 가입된 이메일입니다.'
      })
    }
    const cachedVerifyToken = await this.authCacheService.getVerifyToken('signup', email);
    if (_.isNil(cachedVerifyToken)) {
      throw new NotFoundException({
        message: '인증번호를 요청하지 않았거나 만료되었습니다.',
      });
    }
    if (verifyToken !== cachedVerifyToken) {
      throw new UnauthorizedException({
        message: '인증번호가 일치하지 않습니다.',
      });
    }
    const sameNameUser = await this.usersRepository.findOne({ where: { username } });
    if (!_.isNil(sameNameUser)) {
      throw new ConflictException({
        message: '해당 닉네임으로 이미 가입한 유저가 존재합니다.',
      });
    }
    const passwordHash = this.authHashService.hashPassword(password);
    try {
      await this.localUsersRepository.insert({ username, email, password: passwordHash });
    } catch (e) {
      throw new InternalServerErrorException({
        message: '회원가입하는데 문제가 발생했습니다.',
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
      throw new ConflictException({
        message: '이미 가입된 이메일입니다.'
      })
    }
    const verifyToken = this.createVerifyToken();
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
    const userInfo = await this.localUsersRepository.findOne({where: {id: user.id}, select: ['id', 'password']});
    if (this.authHashService.comparePassword(password, userInfo!.password)) {
      throw new ConflictException({
        message: '기존의 비밀번호로는 변경이 불가능합니다.'
      })
    }
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
    const verifyToken = this.createVerifyToken();
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
    let { accessToken: socialAccessToken, providerUserId, username } = await this.socialService.validateSocialUser(provider, body);

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
        throw new InternalServerErrorException({
          message: '가입에 실패했습니다.',
        });
      }
      user = await socialUsersRepository.findOne({
        where: {
          providerUserId,
        },
      });
      if (_.isNil(user)) {
        return ;
      }
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

  async renewAccessToken(accessToken: string, refreshToken: string) {
    await this.authJwtService.verifyUserAccessTokenWithoutExpiresIn(accessToken);
    const userId = await this.authCacheService.getUserIdByRefreshToken(refreshToken);
    if (_.isNil(userId)) {
      throw new UnauthorizedException({
        message: '리프레시 토큰이 사용 만료되었습니다.',
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

  async postResetPasswordEmailVerification(body: PostResetPasswordEmailVerificationBodyDTO) {
    const { email, url } = body;
    const user = await this.localUsersRepository.findOne({where: { email }})
    if (_.isNil(user)) {
      throw new BadRequestException({
        message: '가입되지 않은 이메일입니다.'
      })
    }
    const verifyToken = this.createVerifyToken();
    await this.mailerAuthService.sendResetPasswordAuthMail(url, email, user.username, verifyToken);
    this.authCacheService.storeVerifyToken('resetPassword', email, verifyToken, 60 * 10);
    return {
      message: '비밀번호 재설정 이메일이 발송되었습니다.',
    };
  }

  async putResetPasswordEmailVerification(body: PutResetPasswordEmailVerificationBodyDTO) {
    const { email, verifyToken, password } = body;
    const cachedVerifyToken = await this.authCacheService.getVerifyToken('resetPassword', email);
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
    const user = await this.localUsersRepository.findOne({where: {email}, select: ['id', 'email', 'password']});
    if (_.isNil(user)) {
      throw new NotFoundException({
        message: '탈퇴한 유저입니다.',
      });
    }
    user.password = this.authHashService.hashPassword(password);
    await this.localUsersRepository.save(user);
    return {
      message: '비밀번호가 재설정되었습니다.'
    }
  }

  private createVerifyToken(): number {
    var minm = 100000;
    var maxm = 999999;
    return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
  }
}
