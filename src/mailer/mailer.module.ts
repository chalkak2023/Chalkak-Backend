import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';
import { MailerConfigService } from './services/mailer.config.service';
import { MailerAuthService } from './services/mailer.auth.service';

@Module({
  imports: [MailerModule.forRootAsync({
    imports: [ConfigModule],
    useClass: MailerConfigService
  })],
  providers: [MailerAuthService],
  exports: [MailerAuthService]
})
export class MailerProviderModule {}
