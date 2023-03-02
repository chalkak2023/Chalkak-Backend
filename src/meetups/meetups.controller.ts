import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { InjectUser } from 'src/auth/auth.decorator';
import { decodedAccessTokenDTO } from 'src/auth/dto/auth.dto';
import { JwtGuard } from 'src/auth/guard/jwt/jwt.guard';
import { CreateMeetupDTO } from './dto/create-meetup.dto';
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
  @UseGuards(JwtGuard)
  async createMeetup(@Body() meetupDTO: CreateMeetupDTO, @InjectUser() userDTO: decodedAccessTokenDTO): Promise<void> {
    meetupDTO.userId = userDTO.id;
    return await this.meetupsService.createMeetup(meetupDTO);
  }

  @Get(':meetupId')
  async getMeetup(@Param('meetupId') meetupId: number): Promise<Meetup> {
    return await this.meetupsService.getMeetup(meetupId);
  }

  @Delete(':meetupId')
  @UseGuards(JwtGuard)
  async deleteMeetup(@Param('meetupId') meetupId: number, @InjectUser() userDTO: decodedAccessTokenDTO): Promise<void> {
    return await this.meetupsService.deleteMeetup(meetupId, userDTO.id);
  }

  @Post(':meetupId/join')
  @UseGuards(JwtGuard)
  async addJoin(@Param('meetupId') meetupId: number, @InjectUser() userDTO: decodedAccessTokenDTO): Promise<void> {
    return await this.meetupsService.addJoin(meetupId, userDTO.id);
  }

  @Delete(':meetupId/join')
  @UseGuards(JwtGuard)
  async deleteJoin(@Param('meetupId') meetupId: number, @InjectUser() userDTO: decodedAccessTokenDTO): Promise<void> {
    return await this.meetupsService.deleteJoin(meetupId, userDTO.id);
  }
}
