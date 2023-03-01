import { Body, Controller, Get, Post, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { Request } from 'express';
import { AdminService } from './admin.service';
import { SignupAdminReqDto } from './dto/signup.admin.req.dto';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('auth')
  async getAdminsList(@Req() req: Request) {
    const result = await this.adminService.getAdminsList('admin');
    if (req.query.keyword) {
      result.where('admin.account LIKE :keyword OR admin.responsibility LIKE :keyword', { keyword: `%${req.query.keyword}` });
    }

    const p: number = parseInt(req.query.p as any) || 1;
    const perPage = 6;
    const total = await result.getCount();

    result.offset((p - 1) * perPage).limit(perPage);

    return {
      data: await result.getMany(),
      total,
      p,
      lastPage: Math.ceil(total / perPage),
    };
  }

  @Post('auth/signup')
  @UsePipes(ValidationPipe)
  async signupAdmin(@Body() data: SignupAdminReqDto) {
    return await this.adminService.signupAdmin(data);
  }
}
