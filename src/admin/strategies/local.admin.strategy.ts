import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import _ from 'lodash';
import { AdminService } from 'src/admin/admin.service';
import { SigninAdminDto } from 'src/admin/dto/signin.admin.dto';

@Injectable()
export class LocalAdminStrategy extends PassportStrategy(Strategy, 'local-admin') {
  constructor(private adminService: AdminService) {
    super({ usernameField: 'account' });
  }
  async validate(account: string, password: string): Promise<SigninAdminDto> {
    let admin = await this.adminService.signinAdmin(account, password);
    if (_.isNil(admin)) {
      throw new UnauthorizedException();
    }
    return admin;
  }
}
