import { createParamDecorator, ExecutionContext, NotFoundException } from '@nestjs/common';
import _ from 'lodash';

export const AdminToken = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const { cookies } = ctx.switchToHttp().getRequest();
  const cookiesData = cookies['auth-cookie'];
  if (_.isNil(cookiesData)) {
    throw new NotFoundException();
  }
  const parsedData = JSON.parse(cookiesData);
  return data ? parsedData?.[data] : parsedData;
});
