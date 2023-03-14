import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AdminToken = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const { cookies } = ctx.switchToHttp().getRequest();
  return data ? JSON.parse(cookies['auth-cookie'])?.[data] : JSON.parse(cookies['auth-cookie']);
});
