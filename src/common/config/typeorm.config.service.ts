import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Admin } from 'src/admin/entities/admin.entity';
import { Faq } from 'src/admin/entities/faq.entity';
import { KakaoUser, NaverUser, User } from 'src/auth/entities/user.entity';
import { Collection } from 'src/collections/entities/collection.entity';
import { Photospot } from 'src/photospot/entities/photospot.entity';
import { Join } from 'src/meetups/entities/join.entity';
import { Meetup } from 'src/meetups/entities/meetup.entity';
import { CollectionKeyword } from 'src/collections/entities/collection.keyword.entity';
import { LocalUser } from '../../auth/entities/user.entity';
import { Photo } from './../../photospot/entities/photo.entity';
import { PhotoKeyword } from './../../photospot/entities/photokeyword.entity';
import { CollectionLike } from 'src/collections/entities/collection.like.entity';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) { }

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.configService.get<string>('DATABASE_HOST'),
      port: this.configService.get<number>('DATABASE_PORT'),
      username: this.configService.get<string>('DATABASE_USERNAME'),
      password: this.configService.get<string>('DATABASE_PASSWORD'),
      database: this.configService.get<string>('DATABASE_NAME'),
      synchronize: Boolean(this.configService.get<string>('DATABASE_SYNC')), // 배포 시 false
      entities: [User, LocalUser, NaverUser, KakaoUser, Collection, CollectionLike, Photospot, Meetup, Join, Admin, Faq, CollectionKeyword, Photo, PhotoKeyword],
    };
  }
}
