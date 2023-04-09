import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/auth/entities/user.entity';

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

  async sendResetPasswordAuthMail(url: string, email: string, username: string, verifyToken: number) {
    const resetLink = `${url}/reset-password?verifyToken=${verifyToken}&email=${email}`
    await this.mailerService.sendMail({
      to: email,
      subject: '[찰칵] 비밀번호 재설정을 위한 링크입니다.',
      template: 'resetPasswordMail',
      context: {
        username,
        resetLink,
      },
    });
  }
}
