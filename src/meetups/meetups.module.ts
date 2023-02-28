import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Join } from './entities/join.entity';
import { Meetup } from './entities/meetup.entity';
import { MeetupsController } from './meetups.controller';
import { MeetupsRepository } from './meetups.repository';
import { MeetupsService } from './meetups.service';

@Module({
  imports: [TypeOrmModule.forFeature([Meetup, Join])],
  controllers: [MeetupsController],
  providers: [MeetupsService, MeetupsRepository]
})
export class MeetupsModule {}
