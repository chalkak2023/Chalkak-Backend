import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Join } from './entities/join.entity';
import { Meetup } from './entities/meetup.entity';
import { MeetupsController } from './meetups.controller';
import { MeetupsRepository } from './meetups.repository';
import { MeetupsService } from './meetups.service';
import { QueueConsumer } from './queue.consumer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meetup, Join]),
    BullModule.registerQueue({
      name: 'joinQueue'
    }),
  ],
  controllers: [MeetupsController],
  providers: [MeetupsService, MeetupsRepository, QueueConsumer]
})
export class MeetupsModule {}
