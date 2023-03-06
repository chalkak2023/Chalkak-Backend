import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import _ from 'lodash';
import { Observable } from 'rxjs';
import { User } from 'src/auth/entities/user.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class BlockUserGuard implements CanActivate {
  constructor(@Inject(DataSource) private readonly dataSource: DataSource) {}

  canActivate(ctx: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const {
      user: { id: userId },
    } = ctx.switchToHttp().getRequest();
    const usersRepository = this.dataSource.getRepository(User);

    return usersRepository
      .findOne({ where: { id: userId } })
      .then((user) => !_.isNil(user))
      .catch((err) => false);
  }
}
