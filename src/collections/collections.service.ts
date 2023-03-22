import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as _ from 'lodash';
import { CollectionUserKeywordRepository } from 'src/collections/collection.user.keyword.repository';
import { Collection } from 'src/collections/entities/collection.entity';
import { CollectionKeyword } from 'src/collections/entities/collection.keyword.entity';
import { CreateCollectionDto } from 'src/collections/dto/create.collection.dto';
import { UpdateCollectionDto } from 'src/collections/dto/update.collection.dto';
import { GetCollectionIdDto } from 'src/collections/dto/get.collection.id.dto';
import { GetCollectionsListQueryDto } from 'src/collections/dto/get.collections.list.query.dto';

@Injectable()
export class CollectionsService {
  constructor(
    private readonly collectionUserKeywordRepository: CollectionUserKeywordRepository,
    @InjectRepository(Collection) private readonly collectionsRepository: Repository<Collection>,
    @InjectRepository(CollectionKeyword) private readonly collectionKeywordsRepository: Repository<CollectionKeyword>
  ) { }

  async getCollectionsList(getCollectionsListQueryDto: GetCollectionsListQueryDto): Promise<Collection[]> {
    getCollectionsListQueryDto.p = getCollectionsListQueryDto.p || 1;
    return await this.collectionUserKeywordRepository.getCollectionsList(getCollectionsListQueryDto);
  }

  async getCollection(collectionId: GetCollectionIdDto['collectionId']): Promise<Collection> {
    const collection = await this.collectionUserKeywordRepository.getCollection(collectionId);
    if (!collection) {
      throw new NotFoundException(`해당 콜렉션을 찾을 수 없습니다.`);
    }
    return collection;
  }

  async createCollection(createCollectionDto: CreateCollectionDto): Promise<Collection> {
    const { userId, title, description, keywords } = createCollectionDto;
    const collection = this.collectionsRepository.create({ userId, title, description })
    const keywordsArray = await this.createCollectionKeyword(keywords)
    collection.collection_keywords = keywordsArray
    return await this.collectionsRepository.save(collection)
  };

  async createCollectionKeyword(keywords: string[]): Promise<CollectionKeyword[]> {
    return Promise.all(
      keywords.map(async (keyword) => {
        let collectionKeyword = await this.collectionKeywordsRepository.findOne({ where: { keyword } });
        if (_.isNil(collectionKeyword)) {
          collectionKeyword = new CollectionKeyword();
          collectionKeyword.keyword = keyword;
          await this.collectionKeywordsRepository.save(collectionKeyword);
        }
        return collectionKeyword;
      }),
    );
  }

  async updateCollection(updateCollectionDto: UpdateCollectionDto, collectionId: number, userId: number): Promise<Collection> {
    const { title, description, keywords } = updateCollectionDto;
    const collection = await this.getCollection(collectionId);
    if (collection.userId !== userId) {
      throw new ForbiddenException('해당 콜렉션 내용의 수정 권한이 없습니다.');
    }
    await this.collectionsRepository.update({ id: collectionId }, { title, description });
    if (_.isNil(keywords)) {
      throw new NotFoundException('해당 콜렉션의 키워드를 찾을 수 없습니다.');
    }
    const keywordsArray = await this.createCollectionKeyword(keywords)
    collection.collection_keywords = keywordsArray
    return await this.collectionsRepository.save(collection)
  }

  async deleteCollection(collectionId: number, userId: number) {
    const collection = await this.getCollection(collectionId);
    if (userId !== collection.userId) {
      throw new ForbiddenException('해당 콜렉션의 삭제 권한이 없습니다.');
    }
    this.collectionsRepository.softDelete(collectionId);
  }
}
