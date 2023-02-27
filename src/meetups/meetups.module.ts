import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Join } from './entities/join.entity';
import { Meetup } from './entities/meetup.entity';
import { MeetupsController } from './meetups.controller';
import { MeetupsService } from './meetups.service';

@Module({
  imports: [TypeOrmModule.forFeature([Meetup, Join])],
  controllers: [MeetupsController],
  providers: [MeetupsService]
})
export class MeetupsModule {}
