import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';
import { Collection } from './entities/collection.entity';
import { CollectionKeyword } from './entities/collection.keyword.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, CollectionKeyword])],
  controllers: [CollectionsController],
  providers: [CollectionsService],
})
export class CollectionsModule {}
