import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException, ForbiddenException, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';
import _ from 'lodash';

@Injectable()
export class BlockUserGuard implements CanActivate {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const {
      user: { id: userId },
    } = ctx.switchToHttp().getRequest();
    const isBlock = await this.cacheManager.get<boolean>(`user-${userId}-block`);
    if (!_.isNil(isBlock)) {
      throw new ForbiddenException({
        message: '블락된 상태여서 사용할 수 없습니다.',
      });
    }

    return true;
  }
}
