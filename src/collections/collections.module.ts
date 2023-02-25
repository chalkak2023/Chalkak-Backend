import { Module } from '@nestjs/common';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';

@Module({
  controllers: [CollectionsController],
  providers: [CollectionsService]
})
export class CollectionsModule {}
