import { Module } from '@nestjs/common';
import { MeetupsController } from './meetups.controller';
import { MeetupsService } from './meetups.service';

@Module({
  controllers: [MeetupsController],
  providers: [MeetupsService]
})
export class MeetupsModule {}
