import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueModule } from 'src/queue/queue.module';
import { Join } from './entities/join.entity';
import { Meetup } from './entities/meetup.entity';
import { MeetupsController } from './meetups.controller';
import { MeetupsRepository } from './meetups.repository';
import { MeetupsService } from './meetups.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meetup, Join]),
    QueueModule
  ],
  controllers: [MeetupsController],
  providers: [MeetupsService, MeetupsRepository],
  exports: [MeetupsService]
})
export class MeetupsModule {}
