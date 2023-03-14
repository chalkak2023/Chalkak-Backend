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
      return {
        store: redisStore,
        host: this.configService.get('CACHE_HOST') || 'localhost',
        port: this.configService.get('CACHE_PORT') || 6379,
        ttl: this.configService.get('CACHE_TTL') ? Number(this.configService.get('CACHE_REDIS_TTL')) : 5,
      }
    } else {
      return {
        store,
        ttl: this.configService.get('CACHE_TTL') ? Number(this.configService.get('CACHE_REDIS_TTL')) : 5,
      }
    }
    
  }
}
