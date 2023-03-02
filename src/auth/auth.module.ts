import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { MailerProviderModule } from 'src/mailer/mailer.module';
import { JwtStrategy } from './guard/jwt/jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtModule, CacheModule.register(), MailerProviderModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
