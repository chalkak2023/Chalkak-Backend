import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const InjectUser = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const { user } = ctx.switchToHttp().getRequest();
  return data ? user?.[data] : user;
});

export const Token = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const { cookies } = ctx.switchToHttp().getRequest();
  return cookies[data];
});
