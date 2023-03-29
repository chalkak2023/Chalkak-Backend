import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import _ from 'lodash';
import { DataSource, Repository } from 'typeorm';
import { Collection } from 'src/collections/entities/collection.entity';
import { CollectionKeyword } from 'src/collections/entities/collection.keyword.entity';
import { User } from 'src/auth/entities/user.entity';
import { GetCollectionsListQueryDto } from 'src/collections/dto/get.collections.list.query.dto';

@Injectable()
export class CollectionsRepository extends Repository<Collection> {
  constructor(private readonly dataSource: DataSource, private readonly configService: ConfigService) {
    super(Collection, dataSource.createEntityManager());
  }

  async getCollectionsList({ p, search, userId }: GetCollectionsListQueryDto) {
    const take = this.configService.get('COLLECTIONS_PAGE_LIMIT') || 18;
    const whereQuery = search || userId ? this.isThereSearchUserid(search, userId) : { q1: '1', q2: {} };
    return await this.createQueryBuilder('c')
      .where(whereQuery.q1, whereQuery.q2)
      .select(['c.id', 'c.title', 'c.description', 'c.userId', 'u.username', 'k.keyword', 'l.userId'])
      .leftJoin('c.user', 'u')
      .leftJoin('c.collectionKeywords', 'k')
      .leftJoin('c.collectionLikes', 'l')
      .innerJoin('c.photospots', 'p')
      .groupBy('c.id, u.id, k.keyword, l.userId')
      .orderBy('c.id', 'DESC')
      .take(take)
      .skip((p - 1) * take)
      .getMany()
  }

  isThereSearchUserid(search?: string, userId?: number): { q1: string; q2: {}; } {
    const myCollectionQuery = 'c.userId = :userId';
    const searchCollectionQuery = 'c.title LIKE :search OR c.description LIKE :search';
    const query = { q1: '', q2: {} };

    if (search && !userId) {
      query.q1 = searchCollectionQuery
      query.q2 = { search: `%${search}%` }
    } else if (!search && userId) {
      query.q1 = myCollectionQuery
      query.q2 = { userId }
    } else if (search && userId) {
      query.q1 = `${myCollectionQuery} AND (${searchCollectionQuery})`
      query.q2 = { userId, search: `%${search}%` }
    } return query
  }

  async getTopCollectionsListForMain(): Promise<Collection[]> {
    const limit = this.configService.get('TOP_COLLECTIONS_PAGE_LIMIT') || 6;
    const result = await this.createQueryBuilder('c')
      .select([
        'c.id',
        'c.title',
        'c.description',
        'c.userId',
        'u.username',
        'COUNT(DISTINCT l.userId) AS likes',
        'GROUP_CONCAT(DISTINCT k.keyword SEPARATOR ", ") AS k_keyword',
        'GROUP_CONCAT(DISTINCT l.userId) AS l_userId',
      ])
      .leftJoin('c.user', 'u')
      .leftJoin('c.collectionLikes', 'l')
      .leftJoin('c.collectionKeywords', 'k')
      .innerJoin('c.photospots', 'p')
      .groupBy('c.id, u.id')
      .orderBy('likes', 'DESC')
      .limit(limit)
      .getRawMany();
    const collections = result.map(rawCollection => {
      const collection = new Collection() as Collection & { isCollectionLiked: boolean; likes: number; };
      collection.id = rawCollection.c_id;
      collection.title = rawCollection.c_title;
      collection.description = rawCollection.c_description;
      collection.userId = rawCollection.c_userId;
      collection.likes = rawCollection.likes;
      collection.isCollectionLiked = rawCollection.l_userId?.split(',').some((user: string) =>
        Number(user) === collection.userId) || false
      const user = new User();
      user.id = rawCollection.u_id;
      user.username = rawCollection.u_username;
      collection.user = user;
      collection.collectionKeywords = rawCollection.k_keyword?.split(',').map((keyword: string) => {
        const collectionKeyword = new CollectionKeyword();
        collectionKeyword.keyword = keyword;
        return collectionKeyword;
      });
      return plainToInstance(Collection, collection)
    })
    return collections;
  }

  async getCollection(collectionId: number): Promise<Collection | null> {
    return await this.createQueryBuilder('c')
      .where('c.id = :id', { id: collectionId })
      .select(['c.id', 'c.userId', 'c.title', 'c.description', 'c.createdAt'])
      .leftJoinAndSelect('c.user', 'cu')
      .leftJoinAndSelect('c.photospots', 'cp')
      .leftJoinAndSelect('cp.photos', 'cpt')
      .leftJoinAndSelect('c.collectionKeywords', 'ck')
      .leftJoinAndSelect('c.collectionLikes', 'cl')
      .getOne();
  }
}
