import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collection } from 'src/collections/entities/collection.entity';
import { CollectionKeyword } from 'src/collections/entities/collection.keyword.entity';
import { CollectionsController } from 'src/collections/collections.controller';
import { CollectionsService } from 'src/collections/collections.service';
import { CollectionsRepository } from 'src/collections/collections.repository';
import { Photo } from 'src/photospot/entities/photo.entity';
import { CollectionLike } from './entities/collection.like.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, CollectionKeyword, Photo, CollectionLike]), JwtModule],
  controllers: [CollectionsController],
  providers: [CollectionsService, CollectionsRepository],
})
export class CollectionsModule { }
