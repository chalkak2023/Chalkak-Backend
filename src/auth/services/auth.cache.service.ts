import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import _ from 'lodash';
import { verifyTokenType } from '../auth.interface';

@Injectable()
export class AuthCacheService {
  constructor(@Inject(CACHE_MANAGER) protected readonly cacheManager: Cache) {}

  async getVerifyToken(type: verifyTokenType, email: string) {
    return await this.cacheManager.get<number>(`${email}_${type}`);
  }

  async storeVerifyToken(type: verifyTokenType, email: string, verifyToken: number) {
    await this.cacheManager.set(`${email}_${type}`, verifyToken, { ttl: 60 * 5 });
  }

  async getUserIdByRefreshToken(refreshToken: string) {
    return await this.cacheManager.get<number>(refreshToken);
  }

  async storeRefreshToken(refreshToken: string, userId: number) {
    await this.cacheManager.set(refreshToken, userId, { ttl: 60 * 60 * 3 });
  }

  async deleteRefreshToken(refreshToken: string) {
    await this.cacheManager.del(refreshToken);
  }
}
