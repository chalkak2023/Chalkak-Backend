import { createParamDecorator, ExecutionContext, NotFoundException, UnauthorizedException } from '@nestjs/common';
import _ from 'lodash';
import { Admin } from '../entities/admin.entity';

export const InjectAdmin = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const { user } = ctx.switchToHttp().getRequest();
  return data ? user?.[data] : user;
});

export const AdminToken = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const { cookies } = ctx.switchToHttp().getRequest();
  const cookiesData = cookies['auth-cookie'];
  if (_.isNil(cookiesData)) {
    throw new NotFoundException();
  }
  const parsedData = JSON.parse(cookiesData);
  return data ? parsedData?.[data] : parsedData;
});

export const isMasterAdmin = createParamDecorator(async (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const admin: Admin = request.user;
    if (admin.account !== 'master') {
      throw new UnauthorizedException('마스터 관리자만 접근할 수 있습니다.');
    }
    return true;
  },
);