import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import { DataSource, Repository } from 'typeorm';
import { Collection } from 'src/collections/entities/collection.entity';

@Injectable()
export class CollectionUserKeywordRepository extends Repository<Collection> {
  constructor(private dataSource: DataSource) {
    super(Collection, dataSource.createEntityManager());
  }

  async getCollectionsList(keyword: string, p: number = 1): Promise<any> {
    const collectionsList = this.createQueryBuilder('collection');
    if (keyword) {
      collectionsList.where('collection.title LIKE :keyword OR collection.description LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
      this.createQueryBuilder('collection')
        .select([
          'collection.id',
          'collection.userId',
          'collection.title',
          'collection.description',
          'collection.createdAt',
          'collection_keyword',
        ])
        .leftJoin('collection.user', 'user')
        .leftJoin('collection.photospots', 'photospot')
        .leftJoin('collection.collection_keywords', 'collection_keyword')
        .orderBy('collection.id', 'DESC');
    }
    const take = 9;
    const page: number = p > 0 ? parseInt(p as any) : 1;
    const total = await collectionsList.getCount();
    collectionsList.skip((page - 1) * take).take(take);
    return {
      data: await collectionsList.getMany(),
      total,
      page,
      lastPage: Math.ceil(total / take),
    };
  }

  async getCollection(collectionId: number): Promise<any> {
    return await this.createQueryBuilder('collection')
      .select([
        'collection.id',
        'collection.userId',
        'collection.title',
        'collection.description',
        'collection.createdAt',
        'collection_keyword',
      ])
      .leftJoin('collection.user', 'user')
      .leftJoin('collection.photospots', 'photospot')
      .leftJoin('collection.collection_keywords', 'collection_keyword')
      .where('collection.id = :id', { id: collectionId })
      .getOne();
  }
}
