import { OnQueueFailed, Process, Processor } from "@nestjs/bull";
import { HttpException } from "@nestjs/common";
import { Job } from "bull";
import { JoinService } from "src/join/join.service";

@Processor('joinQueue')
export class QueueConsumer {
  constructor(
    private readonly joinService: JoinService
  ) {}

  @OnQueueFailed()
  errHandler(job: Job, err: any) {
    console.log('errHandler');
    throw new HttpException(err.message, err.status)
  }

  @Process('addJoinQueue')
  async handleAddJoinQueue(job: Job) {
    return await this.joinService.addJoin(job.data.meetupId, job.data.userId, job.data.eventName);
  }
}