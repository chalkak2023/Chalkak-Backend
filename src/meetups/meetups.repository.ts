import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CreateMeetupDto } from './dto/create-meetup.dto';
import { Join } from './entities/join.entity';
import { Meetup } from './entities/meetup.entity';

@Injectable()
export class MeetupsRepository extends Repository<Meetup> {
  constructor(private dataSource: DataSource) {
    super(Meetup, dataSource.createEntityManager());
  }

  async getMeetups(): Promise<Meetup[]> {
    return await this.createQueryBuilder('meetup')
    .leftJoin('meetup.joins', 'join')
    .select([
      'meetup.id',
      'meetup.userId',
      'meetup.title',
      'meetup.content',
      'meetup.place',
      'meetup.schedule',
      'meetup.headcount',
      'meetup.createdAt',
      'join',
    ])
    .orderBy('meetup.id', 'DESC')
    .getMany();
  }

  async createMeetup(meetupDto: CreateMeetupDto) {
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
}
