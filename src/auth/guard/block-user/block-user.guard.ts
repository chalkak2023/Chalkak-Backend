import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException, ForbiddenException, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';
import _ from 'lodash';
import { User } from 'src/auth/entities/user.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class BlockUserGuard implements CanActivate {
  constructor(@Inject(DataSource) private readonly dataSource: DataSource, @Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const {
      user: { id: userId },
    } = ctx.switchToHttp().getRequest();
    const usersRepository = this.dataSource.getRepository(User);
    const isBlock = await this.cacheManager.get<boolean>(`user-${userId}-block`);
    if (!_.isNil(isBlock)) {
      if (isBlock) {
        throw new ForbiddenException({
          message: '블락된 상태여서 사용할 수 없습니다.'
        })
      }
      return true;
    }
    const user = await usersRepository.findOne({ where: { id: userId } });
    if (_.isNil(user)) {
      throw new UnauthorizedException({
        message: '존재하지 않는 회원입니다.',
      });
    }
    await this.cacheManager.set<boolean>(`user-${userId}-block`, user.isBlock, {
      ttl: 1000 * 60 * 5
    })
    if (user.isBlock) {
      throw new ForbiddenException({
        message: '블락된 상태여서 사용할 수 없습니다.'
      })
    }

    return true;
  }
}
