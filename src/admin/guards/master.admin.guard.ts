import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Admin } from 'src/admin/entities/admin.entity';

@Injectable()
export class MasterAdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean | Promise<boolean> {
    const { user } = ctx.switchToHttp().getRequest();
    const admin: Admin = user;
    if (admin.account !== 'master') {
      throw new UnauthorizedException('마스터 관리자만 접근할 수 있습니다.');
    }
    return true;
  }
};
