import { Controller, Get, Query } from '@nestjs/common';
import { CollectionsService } from 'src/collections/collections.service';
import { Collection } from 'src/collections/entities/collection.entity';

@Controller('/api/collections')
export class CollectionsController {
  constructor(private collectionsService: CollectionsService) {}

  @Get()
  async getCollectionsList(@Query('keyword') keyword: string, @Query('p') p: number = 1): Promise<Collection[]> {
    return await this.collectionsService.getCollectionsList(keyword, p);
  }
}
