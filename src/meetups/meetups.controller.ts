import _ from 'lodash';
import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { InjectUser, UserGuard } from 'src/auth/auth.decorator';
import { decodedAccessTokenDTO } from 'src/auth/dto/auth.dto';
import { CreateMeetupDTO } from './dto/create-meetup.dto';
import { Meetup } from './entities/meetup.entity';
import { MeetupsService } from './meetups.service';

@Controller('api/meetups')
export class MeetupsController {
  constructor(private readonly meetupsService: MeetupsService) {}

  @Get()
  async getMeetups(
    @Query('p', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('keyword', new DefaultValuePipe('')) keyword: string
  ): Promise<Meetup[]> {
    if (page < 1) { page = 1; }
    return await this.meetupsService.getMeetups(page, keyword);
  }

  @Post()
  @UserGuard
  async createMeetup(@Body() meetupDTO: CreateMeetupDTO, @InjectUser() userDTO: decodedAccessTokenDTO): Promise<void> {
    meetupDTO.userId = userDTO.id;
    return await this.meetupsService.createMeetup(meetupDTO);
  }

  @Get(':meetupId')
  async getMeetup(@Param('meetupId') meetupId: number): Promise<Meetup> {
    return await this.meetupsService.getMeetup(meetupId);
  }

  @Delete(':meetupId')
  @UserGuard
  async deleteMeetup(@Param('meetupId') meetupId: number, @InjectUser() userDTO: decodedAccessTokenDTO): Promise<void> {
    return await this.meetupsService.deleteMeetup(meetupId, userDTO.id);
  }

  @Post(':meetupId/join')
  @UserGuard
  async addJoin(@Param('meetupId') meetupId: number, @InjectUser() userDTO: decodedAccessTokenDTO) {
    // return await this.meetupsService.addJoin(meetupId, userDTO.id);
    return await this.meetupsService.addJoinQueue(meetupId, userDTO.id);
  }

  @Delete(':meetupId/join')
  @UserGuard
  async deleteJoin(@Param('meetupId') meetupId: number, @InjectUser() userDTO: decodedAccessTokenDTO): Promise<void> {
    return await this.meetupsService.deleteJoin(meetupId, userDTO.id);
  }
}
