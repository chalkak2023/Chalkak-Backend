import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collection } from 'src/collections/entities/collection.entity';
import { CollectionKeyword } from 'src/collections/entities/collection.keyword.entity';
import { CollectionsController } from 'src/collections/collections.controller';
import { CollectionsService } from 'src/collections/collections.service';
import { CollectionUserKeywordRepository } from 'src/collections/collection.user.keyword.repository';
import { CollectionLike } from './entities/collection.like.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, CollectionKeyword, CollectionLike]), JwtModule],
  controllers: [CollectionsController],
  providers: [CollectionsService, CollectionUserKeywordRepository],
})
export class CollectionsModule { }
