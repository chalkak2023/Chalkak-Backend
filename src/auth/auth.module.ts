import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalUser, User, NaverUser, KakaoUser } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { MailerProviderModule } from 'src/mailer/mailer.module';
import { JwtRefreshStrategy } from './guard/jwt-refresh/jwt-refresh.strategy';
import { JwtStrategy } from './guard/jwt/jwt.strategy';
import { SocialModule } from 'src/social/social.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, LocalUser, NaverUser, KakaoUser]), JwtModule, CacheModule.register(), MailerProviderModule, SocialModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
