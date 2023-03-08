import _ from 'lodash';
import { BadRequestException, ConflictException, ForbiddenException, HttpException, Injectable } from '@nestjs/common';
import { CreateMeetupDTO } from './dto/create-meetup.dto';
import { Meetup } from './entities/meetup.entity';
import { MeetupsRepository } from './meetups.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Join } from './entities/join.entity';
import { DataSource, Repository } from 'typeorm';
import { QueueService } from 'src/queue/queue.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MeetupsService {
  constructor(
    private meetupsRepository: MeetupsRepository,
    @InjectRepository(Join) private joinRepository: Repository<Join>,
    private dataSource: DataSource,
    private queueService: QueueService,
    private eventEmitter: EventEmitter2
  ) {}

  async getMeetups(page: number, keyword: string): Promise<Meetup[]> {
    return await this.meetupsRepository.getMeetups(page, keyword);
  }

  async createMeetup(meetupDto: CreateMeetupDTO): Promise<void> {
    await this.meetupsRepository.createMeetup(meetupDto);
  }

  async getMeetup(meetupId: number): Promise<Meetup> {
    return await this.meetupsRepository.getMeetup(meetupId);
  }

  async deleteMeetup(meetupId: number, userId: number) {
    const meetup = await this.getMeetup(meetupId);
    if (userId !== meetup.userId) {
      throw new ForbiddenException(`모임을 만든 사람만 삭제할 수 있습니다.`);
    }
    await this.meetupsRepository.delete(meetupId);
  }

  async getJoin(meetupId: number, userId: number): Promise<Join | null> {
    return await this.joinRepository.findOne({
      where: { meetupId, userId },
    });
  }

  async addJoinQueue(meetupId: number, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const eventName = `finishJoin-${userId}-${Math.floor(Math.random() * 89999) + 1}`
      await this.queueService.addJoinJob(meetupId, userId, eventName);
      await queryRunner.commitTransaction();
      return this.waitFinish(eventName, 2);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.log(err.message);
      // throw err;
      throw new HttpException(err.message, err.status);
    } finally {
      await queryRunner.release();
    }
  }

  // async addJoin(meetupId: number, userId: number) {
  //   const join = await this.getJoin(meetupId, userId);
  //   if (!_.isNil(join)) {
  //     throw new ConflictException(`이미 참여하고 있는 유저입니다.`);
  //   }
  //   const meetup = await this.getMeetup(meetupId);
  //   if (meetup.headcount <= meetup.joins.length) {
  //     throw new ForbiddenException('정원이 다 찼습니다.');
  //   }
  //   await this.joinRepository.insert({
  //     meetupId, userId
  //   });
  //   // await this.meetupsRepository.addJoin(meetupId, userId, meetup.joins.length);
  // }

  async deleteJoin(meetupId: number, userId: number) {
    await this.getMeetup(meetupId);
    const join = await this.getJoin(meetupId, userId);
    if (_.isNil(join)) {
      throw new BadRequestException(`모임에 참여중인 유저가 아닙니다.`);
    }
    const meetup = await this.getMeetup(meetupId);
    if (meetup.userId === userId) {
      throw new ForbiddenException('모임의 주최자는 참여 취소를 할 수 없습니다.');
    }
    await this.joinRepository.delete({
      meetupId,
      userId,
    });
  }

  private waitFinish(eventName: string, sec: number) {
    return new Promise((resolve, reject) => {
      const wait = setTimeout(() => {
        this.eventEmitter.removeAllListeners(eventName);
        resolve({
          message: '참여 요청',
        });
      }, sec * 1000);
      const listenFn = ({ success, exception }: { success: boolean, exception?: HttpException }) => {
        clearTimeout(wait)
        this.eventEmitter.removeAllListeners(eventName);
        success ? resolve({ message: '참여 성공' }) : reject(exception);
        return ;
      };
      this.eventEmitter.addListener(eventName, listenFn);
    });
  }
}
