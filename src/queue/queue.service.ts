import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('joinQueue') private joinQueue: Queue
  ) {}

  async addJoinJob(meetupId: number, userId: number, eventName: string) {
    const job = await this.joinQueue.add(
      'addJoinQueue',
      { meetupId, userId, eventName},
      { removeOnComplete: true, removeOnFail: true },
    );
    return job;
  }
}
