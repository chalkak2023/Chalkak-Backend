import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalUser, User, NaverUser, KakaoUser } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { MailerProviderModule } from 'src/mailer/mailer.module';
import { JwtRefreshStrategy } from './guard/jwt-refresh/jwt-refresh.strategy';
import { JwtStrategy } from './guard/jwt/jwt.strategy';
import { SocialModule } from 'src/social/social.module';
import { LocalStrategy } from './guard/local/local.strategy';
import { AuthJwtService } from './services/auth.jwt.service';
import { AuthCacheService } from './services/auth.cache.service';
import { AuthHashService } from './services/auth.hash.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, LocalUser, NaverUser, KakaoUser]), JwtModule, MailerProviderModule, SocialModule],
  controllers: [AuthController],
  providers: [AuthService, AuthJwtService, AuthCacheService, AuthHashService, JwtStrategy, JwtRefreshStrategy, LocalStrategy],
})
export class AuthModule {}
