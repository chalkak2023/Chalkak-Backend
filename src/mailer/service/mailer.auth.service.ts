import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailerAuthService {
  constructor(private mailerService: MailerService) {}

  async sendMailAuthMail(email: string, verifyToken: number) {
    await this.mailerService.sendMail({
      to: email,
      subject: '[찰칵] 이메일 인증 요청 메일입니다.',
      template: 'mailAuth',
      context: {
        verifyToken,
      },
    });
  }
}
