import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import { DataSource, Repository } from 'typeorm';
import { Collection } from 'src/collections/entities/collection.entity';
import { GetCollectionsListQueryDto } from 'src/collections/dto/get.collections.list.query.dto';

@Injectable()
export class CollectionUserKeywordRepository extends Repository<Collection> {
  constructor(private dataSource: DataSource) {
    super(Collection, dataSource.createEntityManager());
  }

  async getCollectionsList({ search, p, userId }: GetCollectionsListQueryDto) {
    const collectionsList = this.createQueryBuilder('collection');
    let myCollectionQuery = 'collection.userId = :userId';
    let searchCollectionQuery = 'collection.title LIKE :search OR collection.description LIKE :search';

    if (!search && !userId) {
      collectionsList;
    } else if (search && !userId) {
      collectionsList.where(searchCollectionQuery, { search: `%${search}%` });
    } else if (!search && userId) {
      collectionsList.where(myCollectionQuery, { userId });
    } else {
      collectionsList.where(`${myCollectionQuery} AND (${searchCollectionQuery})`, { userId, search: `%${search}%` });
    }

    collectionsList
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

    const take = 18;
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

  async getCollection(collectionId: number): Promise<Collection | null> {
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
