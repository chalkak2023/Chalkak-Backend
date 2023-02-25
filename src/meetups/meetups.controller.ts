import { Controller, Get } from '@nestjs/common';
import { MeetupsService } from './meetups.service';

@Controller('api/meetups')
export class MeetupsController {
  constructor(private readonly meetupsService: MeetupsService) {}

  @Get()
  getMeetups(): string {
    return this.meetupsService.getMeetups();
  }
}
