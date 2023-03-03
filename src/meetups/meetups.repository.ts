import _ from 'lodash';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CreateMeetupDTO } from './dto/create-meetup.dto';
import { Join } from './entities/join.entity';
import { Meetup } from './entities/meetup.entity';

@Injectable()
export class MeetupsRepository extends Repository<Meetup> {
  constructor(private dataSource: DataSource) {
    super(Meetup, dataSource.createEntityManager());
  }

  async getMeetups(page: number): Promise<Meetup[]> {
    const pageLimit = 9;
    return await this.createQueryBuilder('m')
      .select([
        'm.id',
        'm.userId',
        'u.email',
        'm.title',
        'm.content',
        'm.place',
        'm.schedule',
        'm.headcount',
        'm.createdAt',
        'j',
      ])
      .leftJoin('m.joins', 'j')
      .leftJoin('m.user', 'u')
      .orderBy('m.id', 'DESC')
      .take(pageLimit)  // 몇개를 가져올지 - 기존의 limit
      .skip((page - 1) * pageLimit)  // 몇개를 건너뛰고 보여줄지 - 기존의 offset 
      .getMany();
  }

  async createMeetup(meetupDto: CreateMeetupDTO) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const insertMeetupResult = await queryRunner.manager.getRepository(Meetup).insert(meetupDto);
      await queryRunner.manager.getRepository(Join).insert({
        userId: meetupDto.userId,
        meetupId: insertMeetupResult.raw.insertId,
      });
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err.message);
    } finally {
      await queryRunner.release();
    }
  }

  async getMeetup(meetupId: number): Promise<Meetup> {
    const meetup = await this.createQueryBuilder('m')
      .select([
        'm.id',
        'm.userId',
        'mu.email',
        'm.title',
        'm.content',
        'm.place',
        'm.schedule',
        'm.headcount',
        'm.createdAt',
        'j.userId',
        'u.email',
      ])
      .leftJoin('m.joins', 'j')
      .leftJoin('m.user', 'mu')
      .leftJoin('j.user', 'u')
      .where('m.id = :id', { id: meetupId })
      .getOne();

    if (_.isNil(meetup)) {
      throw new NotFoundException(`해당하는 모임이 존재하지 않음. meetupId: ${meetupId}`);
    }
    return meetup;
  }
}
