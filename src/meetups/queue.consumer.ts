import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { MeetupsService } from "./meetups.service";

@Processor('joinQueue')
export class QueueConsumer {
  constructor(private readonly meetupsService: MeetupsService) {}

  @Process('addJoinQueue')
  async handleAddJoinQueue(job: Job) {
    return await this.meetupsService.addJoin(job.data.meetupId, job.data.userId, job.data.eventName);
  }
}