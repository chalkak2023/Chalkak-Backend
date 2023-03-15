import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailerAuthService {
  constructor(private mailerService: MailerService) {}

  async sendSignupAuthMail(email: string, verifyToken: number) {
    await this.mailerService.sendMail({
      to: email,
      subject: '[찰칵] 회원가입을 위한 인증번호입니다.',
      template: 'signupMailAuth',
      context: {
        verifyToken,
      },
    });
  }

  async sendChangePasswordAuthMail(email: string, verifyToken: number) {
    await this.mailerService.sendMail({
      to: email,
      subject: '[찰칵] 비밀번호 변경을 위한 인증번호입니다.',
      template: 'changePasswordMailAuth',
      context: {
        verifyToken,
      },
    });
  }
}
