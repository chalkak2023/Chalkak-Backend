import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';
import { Collection } from './entities/collection.entity';
import { Photospot } from './entities/photospot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, Photospot])],
  controllers: [CollectionsController],
  providers: [CollectionsService]
})
export class CollectionsModule {}
