import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Meetup } from '../meetups/entities/meetup.entity';

@Injectable()
export class ChatRepository extends Repository<Meetup> {
  constructor(private dataSource: DataSource) {
    super(Meetup, dataSource.createEntityManager());
  }

  async getChats(userId: number): Promise<Meetup[]> {
    return await this.createQueryBuilder('m')
      .select([
        'm.id',
        'm.userId',
        'u.email',
        'u.username',
        'm.title',
        'm.content',
        'm.place',
        'm.schedule',
        'm.headcount',
        'm.createdAt',
        'm.deletedAt',
        'j',
      ])
      .leftJoin('m.joins', 'j')
      .leftJoin('m.user', 'u')
      .withDeleted()
      .where('m.deletedAt IS NOT NULL')
      .andWhere('j.userId = :userId', {
        userId: `${userId}`
      })
      .orderBy('m.deletedAt', 'DESC')
      .getMany();
  }
}
