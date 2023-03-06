import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as _ from 'lodash';
import { CollectionUserKeywordRepository } from 'src/collections/collection.user.keyword.repository';
import { Collection } from 'src/collections/entities/collection.entity';
import { CollectionKeyword } from 'src/collections/entities/collection.keyword.entity';
import { CreateCollectionDto } from 'src/collections/dto/create.collection.dto';
import { UpdateCollectionContentDto } from 'src/collections/dto/update.collection.content.dto';
import { UpdateCollectionKeywordDto } from 'src/collections/dto/update.collection.keyword.dto';
import { AddCollectionKeywordDto } from 'src/collections/dto/add.collection.keyword.dto';

@Injectable()
export class CollectionsService {
  constructor(
    private collectionUserKeywordRepository: CollectionUserKeywordRepository,
    @InjectRepository(Collection) private collectionsRepository: Repository<Collection>,
    @InjectRepository(CollectionKeyword) private collectionKeywordsRepository: Repository<CollectionKeyword>
  ) {}

  async getCollectionsList(keyword: string, p: number): Promise<Collection[]> {
    return await this.collectionUserKeywordRepository.getCollectionsList(keyword, p);
  }

  async getCollection(collectionId: number): Promise<Collection> {
    const collection = await this.collectionUserKeywordRepository.getCollection(collectionId);
    if (!collection) {
      throw new NotFoundException(`해당 콜렉션을 찾을 수 없습니다.`);
    }
    return collection;
  }

  async getCollectionKeyword(keywordId: number): Promise<CollectionKeyword> {
    const collectionKeyword = await this.collectionKeywordsRepository.findOne({ where: { id: keywordId } });
    if (_.isNil(collectionKeyword)) {
      throw new NotFoundException('해당 콜렉션의 키워드를 찾을 수 없습니다.');
    }
    return collectionKeyword;
  }

  createCollection(createCollectionDto: CreateCollectionDto) {
    const { userId, title, description, keyword } = createCollectionDto;
    this.collectionsRepository.save({
      userId,
      title,
      description,
      collection_keywords: keyword.map((keyword) => ({
        userId,
        keyword,
      })),
    });
  }

  async addCollectionKeyword(addCollectionKeywordDto: AddCollectionKeywordDto, collectionId: number, userId: number) {
    const { keyword }: AddCollectionKeywordDto = addCollectionKeywordDto;
    const collectionKeyword = await this.getCollection(collectionId);
    if (userId !== collectionKeyword.userId) {
      throw new ForbiddenException('해당 콜렉션 키워드의 추가 권한이 없습니다.');
    }
    await this.collectionKeywordsRepository.insert({ keyword, collectionId, userId });
  }

  async updateCollectionContent(updateCollectionContentDto: UpdateCollectionContentDto, collectionId: number, userId: number) {
    const collectionContent = await this.getCollection(collectionId);
    if (collectionContent.userId !== userId) {
      throw new ForbiddenException('해당 콜렉션 내용의 수정 권한이 없습니다.');
    }
    await this.collectionsRepository.update({ id: collectionId }, updateCollectionContentDto);
  }

  async updateCollectionKeyword(
    updateCollectionKeywordDto: UpdateCollectionKeywordDto,
    collectionId: number,
    keywordId: number,
    userId: number
  ) {
    const collectionKeyword = await this.getCollection(collectionId);
    if (collectionKeyword.userId !== userId) {
      throw new ForbiddenException('해당 콜렉션 키워드의 수정 권한이 없습니다.');
    }
    await this.getCollectionKeyword(keywordId);
    await this.collectionKeywordsRepository.update({ id: keywordId }, updateCollectionKeywordDto);
  }

  async deleteCollection(collectionId: number, userId: number) {
    const collection = await this.getCollection(collectionId);
    if (userId !== collection.userId) {
      throw new ForbiddenException('해당 콜렉션의 삭제 권한이 없습니다.');
    }
    this.collectionsRepository.softDelete(collectionId);
  }

  async deleteCollectionKeyword(collectionId: number, keywordId: number, userId: number) {
    const collection = await this.getCollection(collectionId);
    if (userId !== collection.userId) {
      throw new ForbiddenException('해당 콜렉션 키워드의 삭제 권한이 없습니다.');
    }
    await this.getCollectionKeyword(keywordId);
    this.collectionKeywordsRepository.softDelete({ id: keywordId });
  }
}
