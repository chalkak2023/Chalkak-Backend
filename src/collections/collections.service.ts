import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as _ from 'lodash';
import { CollectionUserKeywordRepository } from 'src/collections/collection.user.keyword.repository';
import { Collection } from 'src/collections/entities/collection.entity';
import { CollectionKeyword } from 'src/collections/entities/collection.keyword.entity';
import { CreateCollectionDto } from 'src/collections/dto/create.collection.dto';
import { UpdateCollectionContentDto } from 'src/collections/dto/update.collection.content.dto';
import { UpdateCollectionKeywordDto } from 'src/collections/dto/update.collection.keyword.dto';

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

  async getColletion(collectionId: number): Promise<Collection> {
    return await this.collectionUserKeywordRepository.getColletion(collectionId);
  }

  async createCollection(createCollectionDto: CreateCollectionDto): Promise<void> {
    await this.collectionsRepository.save(createCollectionDto);
  }

  async updateCollectionContent(updateCollectionContentDto: UpdateCollectionContentDto, collectionId: number, userId: number) {
    const collectionContent = await this.getColletion(collectionId);
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
    const collectionKeyword = await this.getColletion(collectionId);
    if (collectionKeyword.userId !== userId) {
      throw new ForbiddenException('해당 콜렉션 키워드의 수정 권한이 없습니다.');
    }
    await this.collectionKeywordsRepository.update({ id: keywordId }, updateCollectionKeywordDto);
  }

  async deleteCollection(collectionId: number, userId: number) {
    const collection = await this.getColletion(collectionId);
    if (userId !== collection.userId) {
      throw new ForbiddenException('해당 콜렉션의 삭제 권한이 없습니다.');
    }
    return this.collectionsRepository.softDelete(collectionId);
  }

  async deleteCollectionKeyword(collectionId: number, keywordId: number, userId: number) {
    const collection = await this.getColletion(collectionId);
    if (userId !== collection.userId) {
      throw new ForbiddenException('해당 콜렉션 키워드의 삭제 권한이 없습니다.');
    }
    return this.collectionKeywordsRepository.softDelete({ id: keywordId });
  }
}
