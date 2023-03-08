import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { JoinModule } from 'src/join/join.module';
import { QueueConsumer } from './queue.consumer';
import { QueueService } from './queue.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'joinQueue'
    }),
    JoinModule
  ],
  providers: [QueueService, QueueConsumer],
  exports: [QueueService]
})
export class QueueModule {} 
