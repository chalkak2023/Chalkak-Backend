import { CanActivate, ExecutionContext, Inject, Injectable, BadRequestException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import _ from 'lodash';
import { Observable } from 'rxjs';
import { User } from 'src/auth/entities/user.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class BlockUserGuard implements CanActivate {
  constructor(@Inject(DataSource) private readonly dataSource: DataSource) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const {
      user: { id: userId },
    } = ctx.switchToHttp().getRequest();
    const usersRepository = this.dataSource.getRepository(User);
    const user = await usersRepository.findOne({ where: { id: userId } });
    if (_.isNil(user)) {
      throw new UnauthorizedException({
        message: '존재하지 않는 회원입니다.',
      });
    }
    if (user.isBlock) {
      throw new ForbiddenException({
        message: '블락된 상태여서 사용할 수 없습니다.'
      })
    }

    return true;
  }
}
