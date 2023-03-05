import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import { Collection } from 'src/collections/entities/collection.entity';
import { CollectionUserKeywordRepository } from 'src/collections/collection.user.keyword.repository';

@Injectable()
export class CollectionsService {
  constructor(private collectionUserKeywordRepository: CollectionUserKeywordRepository) {}

  async getCollectionsList(keyword: string, p: number): Promise<Collection[]> {
    return await this.collectionUserKeywordRepository.getCollectionsList(keyword, p);
  }
}
