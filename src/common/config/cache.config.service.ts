import { CacheModuleOptions, CacheOptionsFactory, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StoreConfig } from 'cache-manager';
import redisStore from 'cache-manager-redis-store';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createCacheOptions(): CacheModuleOptions<StoreConfig> {
    const store = this.configService.get('CACHE_STORE_NAME') || 'memory'
    if (store === 'redis') {
      const username = this.configService.get('CACHE_REDIS_USERNAME');
      const password = this.configService.get('CACHE_REDIS_PASSWORD');
      const config: CacheModuleOptions<StoreConfig> = {
        store: redisStore,
        host: this.configService.get('CACHE_HOST') || 'localhost',
        port: this.configService.get('CACHE_PORT') ? Number(this.configService.get('CACHE_PORT')) : 6379,
        ttl: this.configService.get('CACHE_TTL') ? Number(this.configService.get('CACHE_TTL')) : 5,
      }
      if (username) {
        config.username = username
      }
      if (password) {
        config.passowd = password
      }
      return config
    } else {
      return {
        store,
        ttl: this.configService.get('CACHE_TTL') ? Number(this.configService.get('CACHE_TTL')) : 5,
      }
    }
    
  }
}
