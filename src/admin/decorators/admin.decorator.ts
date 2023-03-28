import { createParamDecorator, ExecutionContext, NotFoundException, UseGuards } from '@nestjs/common';
import _ from 'lodash';
import { MasterAdminGuard } from 'src/admin/guards/master.admin.guard';

export const AdminGuard = UseGuards(MasterAdminGuard);

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
