import { createParamDecorator, ExecutionContext, UseGuards } from '@nestjs/common';
import { JwtGuard } from './guard/jwt/jwt.guard';
import { BlockUserGuard } from './guard/block-user/block-user.guard';

export const UserGuard = UseGuards(JwtGuard, BlockUserGuard);

export const InjectUser = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const { user } = ctx.switchToHttp().getRequest();
  return data ? user?.[data] : user;
});

export const Token = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const { cookies } = ctx.switchToHttp().getRequest();
  return cookies[data];
});
