import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AdminService } from 'src/admin/admin.service';
import { Admin } from 'src/admin/entities/admin.entity';
import { User } from 'src/auth/entities/user.entity';
import { Collection } from 'src/collections/entities/collection.entity';
import { Photospot } from 'src/photospot/entities/photospot.entity';
import { Meetup } from 'src/meetups/entities/meetup.entity';
import { Faq } from 'src/admin/entities/faq.entity';
import { SignupAdminReqDto } from 'src/admin/dto/signup.admin.req.dto';
import { SigninAdminDto } from 'src/admin/dto/signin.admin.dto';
import { BlockAdminUserDto } from 'src/admin/dto/block.admin.user.dto';
import { CreateAdminFaqDto } from 'src/admin/dto/create.admin.faq.dto';
import { UpdateAdminFaqDto } from 'src/admin/dto/update.admin.faq.dto';
import { AdminToken } from './decorators/auth.admin.decorator';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  // 관리자 관리
  @Get('auth')
  @UseGuards(AuthGuard('jwt-admin'))
  async getAdminsList(@Query('search') search: string, @Query('p') p: number = 1): Promise<Admin[]> {
    return await this.adminService.getAdminsList(search, p);
  }

  @Post('auth/signup')
  @UseGuards(AuthGuard('jwt-admin'))
  async signupAdmin(@Body() data: SignupAdminReqDto) {
    return await this.adminService.signupAdmin(data);
  }

  @Post('auth/signin')
  @UseGuards(AuthGuard('local-admin'))
  @HttpCode(200)
  async signinAdmin(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const admin = req.user as SigninAdminDto;
    const accessToken = await this.adminService.issueAccessToken(admin);
    const refreshToken = await this.adminService.issueRefreshToken(admin.id);
    const jwtData = { accessToken, refreshToken };
    return { data: jwtData, message: '로그인에 성공하였습니다.' };
  }

  @Get('auth/signin')
  @UseGuards(AuthGuard('jwt-refresh-admin'))
  async reissueTokens(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
    @AdminToken('refreshToken') refreshToken: string
  ) {
    const admin = req.user as SigninAdminDto;
    const accessToken = await this.adminService.issueAccessToken(admin);
    const jwtData = { accessToken, refreshToken };
    return { data: jwtData, message: 'Access 토큰을 정상적으로 재발급하였습니다.' };
  }

  @Delete('auth/:id')
  @UseGuards(AuthGuard('jwt-admin'))
  async deleteAdmin(@Param('id') id: number) {
    return this.adminService.deleteAdmin(id);
  }

  @Post('auth/signout')
  @UseGuards(AuthGuard('jwt-admin'))
  signoutAdmin(@Req() req: Request, @Res() res: Response): any {
    return res.send({ message: '정상적으로 로그아웃하였습니다.' });
  }

  // 유저 관리
  @Get('users')
  @UseGuards(AuthGuard('jwt-admin'))
  async getAdminUsersList(@Query('search') search: string, @Query('p') p: number = 1): Promise<User[]> {
    return await this.adminService.getAdminUsersList(search, p);
  }

  @Put('users/:id')
  @UseGuards(AuthGuard('jwt-admin'))
  async blockAdminUser(@Param('id') id: string, @Body() blockUser: BlockAdminUserDto) {
    const { isBlock } = blockUser;
    return await this.adminService.blockAdminUser(id, { isBlock: !isBlock });
  }

  // 콜렉션 관리
  @Get('collections')
  @UseGuards(AuthGuard('jwt-admin'))
  async getAdminCollectionsList(@Query('search') search: string, @Query('p') p: number = 1): Promise<Collection[]> {
    return await this.adminService.getAdminCollectionsList(search, p);
  }

  @Delete('collections/:id')
  @UseGuards(AuthGuard('jwt-admin'))
  async deleteAdminCollection(@Param('id') id: number) {
    return await this.adminService.deleteAdminCollection(id);
  }

  // 포토스팟 관리
  @Get(':collectionId/photospots')
  @UseGuards(AuthGuard('jwt-admin'))
  async getAdminPhotospotList(@Param('collectionId') collectionId: number): Promise<Photospot[]> {
    return this.adminService.getAdminPhotospotList(collectionId);
  }

  @Get(':collectionId/photospots/:photospotId')
  @UseGuards(AuthGuard('jwt-admin'))
  async getAdminPhotospot(@Param('photospotId') photospotId: number): Promise<Photospot> {
    return this.adminService.getAdminPhotospot(photospotId);
  }

  @Delete(':collectionId/photospots/:photospotId')
  @UseGuards(AuthGuard('jwt-admin'))
  async deleteAdminPhotospot(@Param('photospotId') photospotId: number) {
    await this.adminService.deleteAdminPhotospot(photospotId);
  }

  // 모임 관리
  @Get('meetups')
  @UseGuards(AuthGuard('jwt-admin'))
  async getAdminMeetupsList(@Query('search') search: string, @Query('p') p: number = 1): Promise<Meetup[]> {
    return await this.adminService.getAdminMeetupsList(search, p);
  }

  @Delete('meetups/:id')
  @UseGuards(AuthGuard('jwt-admin'))
  async deleteAdminMeetup(@Param('id') id: number) {
    return await this.adminService.deleteAdminMeetup(id);
  }

  // 자주찾는질문 관리
  @Get('faq')
  @UseGuards(AuthGuard('jwt-admin'))
  async getAdminFaqList(@Query('search') search: string, @Query('p') p: number = 1): Promise<Faq[]> {
    return await this.adminService.getAdminFaqList(search, p);
  }

  @Get('faq/:id')
  @UseGuards(AuthGuard('jwt-admin'))
  async getAdminFaq(@Param('id') id: number): Promise<Faq> {
    return this.adminService.getAdminFaq(id);
  }

  @Post('faq')
  @UseGuards(AuthGuard('jwt-admin'))
  async createAdminFaq(@Body() data: CreateAdminFaqDto) {
    return await this.adminService.createAdminFaq(data);
  }

  @Put('faq/:id')
  @UseGuards(AuthGuard('jwt-admin'))
  async updateAdminFaq(@Param('id') id: number, @Body() updateAdminFaqtDto: UpdateAdminFaqDto) {
    await this.adminService.updateAdminFaq(updateAdminFaqtDto, id);
  }

  @Delete('faq/:id')
  @UseGuards(AuthGuard('jwt-admin'))
  async deleteAdminFaq(@Param('id') id: number) {
    return await this.adminService.deleteAdminFaq(id);
  }
}
