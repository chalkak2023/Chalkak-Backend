import _ from 'lodash';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Join } from 'src/meetups/entities/join.entity';
import { DataSource, Repository } from 'typeorm';
import { Meetup } from '../meetups/entities/meetup.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';

@Injectable()
export class ChatRepository extends Repository<Chat> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Meetup) private meetupRepository: Repository<Meetup>,
  ) {
    super(Chat, dataSource.createEntityManager());
  }

  async getChatRooms(userId: number): Promise<Meetup[]> {
    const chatIds = await this.meetupRepository.createQueryBuilder('m')
      .select('j.meetupId', 'meetupId')
      .leftJoin('m.joins', 'j')
      .withDeleted()
      .where('m.deletedAt IS NOT NULL')
      .andWhere('j.userId = :userId', { userId })
      .getRawMany();

    return await this.meetupRepository.createQueryBuilder('m')
      .select([
        'm.id',
        'm.userId',
        'mu.email',
        'mu.username',
        'm.title',
        'm.content',
        'm.place',
        'm.schedule',
        'm.headcount',
        'm.createdAt',
        'm.deletedAt',
        'j.userId',
        'u.email',
        'u.username',
      ])
      .leftJoin('m.joins', 'j')
      .leftJoin('m.user', 'mu')
      .leftJoin('j.user', 'u')
      .withDeleted()
      .where('m.deletedAt IS NOT NULL')
      .andWhereInIds(chatIds.map((id) => id.meetupId))
      .orderBy('m.deletedAt', 'DESC')
      .getMany();
  }

  async exitChatRoom(meetupId: number, userId: number) {
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
