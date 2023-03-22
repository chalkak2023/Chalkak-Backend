import _ from 'lodash';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Join } from 'src/meetups/entities/join.entity';
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

  async exitChat(meetupId: number, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    
    const findJoinArr = await queryRunner.manager.getRepository(Join).find({
      where: { meetupId }
    });
    const includeUserIdObj = findJoinArr.find(
      (join) => join.userId === userId
    )
    if (_.isNil(includeUserIdObj)) {
      throw new BadRequestException(`모임에 참여중인 유저가 아닙니다.`);
    }

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.getRepository(Join).delete({ meetupId, userId });

      // 해당 meetup에 참여한 유저가 1명만 남아있었던 경우 meetup까지 제거
      if (findJoinArr.length === 1) {
        await queryRunner.manager.getRepository(Meetup).delete(meetupId);
      } 
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err.message);
    } finally {
      await queryRunner.release();
    }
  }
}
