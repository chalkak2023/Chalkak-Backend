import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DeleteResult, UpdateResult } from 'typeorm';
import { AdminService } from 'src/admin/admin.service';
import { Admin } from 'src/admin/entities/admin.entity';
import { User } from 'src/auth/entities/user.entity';
import { Collection } from 'src/collections/entities/collection.entity';
import { Photospot } from 'src/photospot/entities/photospot.entity';
import { Meetup } from 'src/meetups/entities/meetup.entity';
import { Faq } from 'src/admin/entities/faq.entity';
import { AdminGetListQueryDto } from 'src/admin/dto/admin.get.list.dto';
import { SignupAdminReqDto } from 'src/admin/dto/signup.admin.req.dto';
import { SignupAdminResDto } from 'src/admin/dto/signup.admin.res.dto';
import { BlockAdminUserDto } from 'src/admin/dto/block.admin.user.dto';
import { CreateAdminFaqDto } from 'src/admin/dto/create.admin.faq.dto';
import { UpdateAdminFaqDto } from 'src/admin/dto/update.admin.faq.dto';
import { AdminToken, InjectAdmin } from 'src/admin/decorators/admin.decorator';
import { MasterAdminGuard } from 'src/admin/guards/master.admin.guard';

interface PaginatedList<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
}

type JwtResult = { jwtData: { accessToken: string; refreshToken: string; }; message: string; }

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) { }

  // 관리자 관리
  @Get('auth')
  @UseGuards(AuthGuard('jwt-admin'))
  async getAdminsList(@Query() adminGetListQueryDto: AdminGetListQueryDto): Promise<PaginatedList<Admin>> {
    return await this.adminService.getAdminsList(adminGetListQueryDto);
  }

  @Post('auth/signup')
  @UseGuards(AuthGuard('jwt-admin'))
  async signupAdmin(@Body() data: SignupAdminReqDto): Promise<SignupAdminResDto> {
    return await this.adminService.signupAdmin(data);
  }

  @Post('auth/signin')
  @UseGuards(AuthGuard('local-admin'))
  @HttpCode(200)
  async signinAdmin(@InjectAdmin() user: Admin): Promise<JwtResult> {
    return await this.adminService.signinAdmin(user);
  }

  @Get('auth/signin')
  @UseGuards(AuthGuard('jwt-refresh-admin'))
  async reissueAdminAccessToken(
    @AdminToken('refreshToken') refreshToken: string,
    @InjectAdmin() user: Admin): Promise<JwtResult> {
    return await this.adminService.reissueAdminAccessToken(refreshToken, user);
  }

  @Delete('auth/:id')
  @UseGuards(AuthGuard('jwt-admin'), MasterAdminGuard)
  deleteAdmin(@Param('id') id: number): Promise<DeleteResult> {
    return this.adminService.deleteAdmin(id);
  }

  @Post('auth/signout')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt-admin'))
  signoutAdmin(@AdminToken('id') id: number): Promise<UpdateResult> {
    return this.adminService.signoutAdmin(id);
  }

  // 유저 관리
  @Get('users')
  @UseGuards(AuthGuard('jwt-admin'))
  async getAdminUsersList(@Query() adminGetListQueryDto: AdminGetListQueryDto): Promise<PaginatedList<User>> {
    return await this.adminService.getAdminUsersList(adminGetListQueryDto);
  }

  @Put('users/:id')
  @UseGuards(AuthGuard('jwt-admin'))
  async blockAdminUser(@Param('id') id: string, @Body() blockUser: BlockAdminUserDto): Promise<UpdateResult> {
    const { isBlock } = blockUser;
    return await this.adminService.blockAdminUser(id, { isBlock: !isBlock });
  }

  // 콜렉션 관리
  @Get('collections')
  @UseGuards(AuthGuard('jwt-admin'))
  async getAdminCollectionsList(@Query() adminGetListQueryDto: AdminGetListQueryDto): Promise<PaginatedList<Collection>> {
    return await this.adminService.getAdminCollectionsList(adminGetListQueryDto);
  }

  @Delete('collections/:id')
  @UseGuards(AuthGuard('jwt-admin'))
  async deleteAdminCollection(@Param('id') id: number): Promise<UpdateResult> {
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
  async deleteAdminPhotospot(@Param('photospotId') photospotId: number): Promise<void> {
    await this.adminService.deleteAdminPhotospot(photospotId);
  }

  // 모임 관리
  @Get('meetups')
  @UseGuards(AuthGuard('jwt-admin'))
  async getAdminMeetupsList(@Query() adminGetListQueryDto: AdminGetListQueryDto): Promise<PaginatedList<Meetup>> {
    return await this.adminService.getAdminMeetupsList(adminGetListQueryDto);
  }

  @Delete('meetups/:id')
  @UseGuards(AuthGuard('jwt-admin'))
  async deleteAdminMeetup(@Param('id') id: number): Promise<DeleteResult> {
    return await this.adminService.deleteAdminMeetup(id);
  }

  // 자주찾는질문 관리
  @Get('faq')
  @UseGuards(AuthGuard('jwt-admin'))
  async getAdminFaqList(@Query() adminGetListQueryDto: AdminGetListQueryDto): Promise<PaginatedList<Faq>> {
    return await this.adminService.getAdminFaqList(adminGetListQueryDto);
  }

  @Get('faq/:id')
  @UseGuards(AuthGuard('jwt-admin'))
  async getAdminFaq(@Param('id') id: number): Promise<Faq> {
    return this.adminService.getAdminFaq(id);
  }

  @Post('faq')
  @UseGuards(AuthGuard('jwt-admin'))
  async createAdminFaq(@Body() data: CreateAdminFaqDto): Promise<void> {
    return await this.adminService.createAdminFaq(data);
  }

  @Put('faq/:id')
  @UseGuards(AuthGuard('jwt-admin'))
  async updateAdminFaq(
    @Param('id') id: number,
    @Body() updateAdminFaqtDto: UpdateAdminFaqDto): Promise<void> {
    await this.adminService.updateAdminFaq(updateAdminFaqtDto, id);
  }

  @Delete('faq/:id')
  @UseGuards(AuthGuard('jwt-admin'))
  async deleteAdminFaq(@Param('id') id: number): Promise<UpdateResult> {
    return await this.adminService.deleteAdminFaq(id);
  }
}