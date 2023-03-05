import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as _ from 'lodash';
import { Collection } from 'src/collections/entities/collection.entity';
import { CollectionUserKeywordRepository } from 'src/collections/collection.user.keyword.repository';
import { CreateCollectionDto } from 'src/collections/dto/create.collection.dto';

@Injectable()
export class CollectionsService {
  constructor(
    private collectionUserKeywordRepository: CollectionUserKeywordRepository,
    @InjectRepository(Collection) private collectionsRepository: Repository<Collection>
  ) {}

  async getCollectionsList(keyword: string, p: number): Promise<Collection[]> {
    return await this.collectionUserKeywordRepository.getCollectionsList(keyword, p);
  }

  async getColletion(collectionId: number): Promise<Collection> {
    return await this.collectionUserKeywordRepository.getColletion(collectionId);
  }

  async createCollection(createCollectionDto: CreateCollectionDto): Promise<void> {
    await this.collectionsRepository.save(createCollectionDto);
  }
}
