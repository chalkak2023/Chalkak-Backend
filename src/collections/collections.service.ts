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
import { GetCollectionsListDto } from 'src/collections/dto/get.collections.list.dto';

@Injectable()
export class CollectionsService {
  constructor(
    private collectionUserKeywordRepository: CollectionUserKeywordRepository,
    @InjectRepository(Collection) private readonly collectionsRepository: Repository<Collection>,
    @InjectRepository(CollectionKeyword) private readonly collectionKeywordsRepository: Repository<CollectionKeyword>
  ) {}

  async getCollectionsList(getCollectionsListDto: GetCollectionsListDto) {
    getCollectionsListDto.p = getCollectionsListDto.p || 1;
    return await this.collectionUserKeywordRepository.getCollectionsList(getCollectionsListDto);
  }

  async getCollection(collectionId: GetCollectionIdDto['collectionId']): Promise<Collection> {
    const collection = await this.collectionUserKeywordRepository.getCollection(collectionId);
    if (!collection) {
      throw new NotFoundException(`해당 콜렉션을 찾을 수 없습니다.`);
    }
    return collection;
  }

  createCollection(createCollectionDto: CreateCollectionDto) {
    const { userId, title, description, keyword } = createCollectionDto;
    return this.collectionsRepository.save({
      userId,
      title,
      description,
      collection_keywords: keyword.map((keyword) => ({
        userId,
        keyword,
      })),
    });
  }

  async updateCollection(updateCollectionDto: UpdateCollectionDto, collectionId: number, userId: number) {
    const { title, description, keyword } = updateCollectionDto;
    const collection = await this.getCollection(collectionId);
    if (collection.userId !== userId) {
      throw new ForbiddenException('해당 콜렉션 내용의 수정 권한이 없습니다.');
    }
    await this.collectionsRepository.update({ id: collectionId }, { title, description });
    if (keyword) {
      const prevKeywordObj = await this.collectionKeywordsRepository.find({ where: { collectionId } });
      const prevKeyword = prevKeywordObj.map((obj) => obj.keyword);
      const newKeywords = _.difference(keyword, prevKeyword);
      const delKeywords = _.difference(prevKeyword, keyword);
      for (let keywordText of newKeywords) {
        await this.collectionKeywordsRepository.insert({ keyword: keywordText, collectionId, userId });
      }
      for (let keywordText of delKeywords) {
        await this.collectionKeywordsRepository.softDelete({ keyword: keywordText, collectionId, userId });
      }
    }
    return {};
  }

  async deleteCollection(collectionId: number, userId: number) {
    const collection = await this.getCollection(collectionId);
    if (userId !== collection.userId) {
      throw new ForbiddenException('해당 콜렉션의 삭제 권한이 없습니다.');
    }
    this.collectionsRepository.softDelete(collectionId);
  }
}
