import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
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
  async deleteMeetup(@Param('meetupId') meetupId: number, @Req() req: Request): Promise<void> {
    const { userId } = req.cookies;
    if (userId === '' || isNaN(userId)) {
      throw new BadRequestException('userId가 잘못되었습니다.');
    }
    return await this.meetupsService.deleteMeetup(meetupId, parseInt(userId));
  }

  @Post(':meetupId/join')
  async addJoin(@Param('meetupId') meetupId: number, @Req() req: Request): Promise<void> {
    const { userId } = req.cookies;
    if (userId === '' || isNaN(userId)) {
      throw new BadRequestException('userId가 잘못되었습니다.');
    }
    return await this.meetupsService.addJoin(meetupId, parseInt(userId));
  }
}
