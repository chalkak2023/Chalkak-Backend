import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateMeetupDto } from './dto/create-meetup.dto';
import { Meetup } from './entities/meetup.entity';
import { MeetupsService } from './meetups.service';

@Controller('api/meetups')
export class MeetupsController {
  constructor(private readonly meetupsService: MeetupsService) {}

  @Get()
  async getMeetups(): Promise<Meetup[]> {
    return await this.meetupsService.getMeetups();
  }

  @Post()
  async createMeetup(@Body() meetupDto: CreateMeetupDto): Promise<void> {
    return await this.meetupsService.createMeetup(meetupDto);
  }

  @Get(':meetupId')
  async getMeetup(@Param('meetupId') meetupId: number): Promise<Meetup> {
    return await this.meetupsService.getMeetup(meetupId);
  }

  @Delete(':meetupId')
  async deleteMeetup(@Param('meetupId') meetupId: number): Promise<void> {
    const userId: number = 1;
    return await this.meetupsService.deleteMeetup(meetupId, userId);
  }
}
