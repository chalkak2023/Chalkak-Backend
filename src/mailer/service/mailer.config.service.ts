import { Injectable } from '@nestjs/common';
import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';
import path from 'path';

@Injectable()
export class MailerConfigService {
  private host: string;
  private port: number;
  private user: string;
  private pass: string;
  private secure: boolean;

  constructor(private configService: ConfigService) {
    this.host = this.configService.get('MAILER_HOST')!;
    this.port = parseInt(this.configService.get('MAILER_HOST')!, 10);
    this.user =  this.configService.get('MAILER_USER')!;
    this.pass =  this.configService.get('MAILER_PASS')!;
    this.secure = this.configService.get('MAILER_SECURE')! === true ? true : false
  }

  createMailerOptions(): Promise<MailerOptions> | MailerOptions {
    return {
      transport: {
        host: this.host,
        port: this.port,
        secure: this.secure,
        auth: {
          user: this.user,
          pass: this.pass,
        },
      },
      defaults: {
        from: '"찰칵" <chalkak@gmail.com>',
      },
      template: {
        dir: path.join(process.cwd(), 'mailTemplates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    };
  }
}
