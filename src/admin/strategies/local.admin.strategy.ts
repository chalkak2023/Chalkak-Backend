import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AdminService } from 'src/admin/admin.service';

@Injectable()
export class LocalAdminStrategy extends PassportStrategy(Strategy, 'local-admin') {
  constructor(private adminService: AdminService) {
    super({ usernameField: 'account' });
  }
  async validate(account: string, password: string) {
    const admin = await this.adminService.verifyAdmin(account, password);
    return admin;
  }
}
