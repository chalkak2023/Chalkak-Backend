import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AdminService } from 'src/admin/admin.service';
import { SigninAdminDto } from 'src/admin/dto/signin.admin.dto';
import { SignupAdminReqDto } from 'src/admin/dto/signup.admin.req.dto';

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

  @Post('auth/signin')
  @UseGuards(AuthGuard('local'))
  @HttpCode(200)
  async signinAdmin(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as SigninAdminDto;
    const accessToken = await this.adminService.issueAccessToken(user);
    const refreshToken = await this.adminService.issueRefreshToken(user.id);
    const jwtData = { accessToken, refreshToken };
    res.cookie('auth-cookie', jwtData, { httpOnly: true });
    return { data: jwtData, message: '로그인에 성공하였습니다.' };
  }

  @Get('auth/signin')
  @UseGuards(AuthGuard('refresh'))
  async reissueTokens(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const user = req.user as SigninAdminDto;
    const accessToken = await this.adminService.issueAccessToken(user);
    const refreshToken = await this.adminService.issueRefreshToken(user.id);
    const jwtData = { accessToken, refreshToken };
    res.cookie('auth-cookie', jwtData, { httpOnly: true });
    return { message: 'Refresh 토큰이 정상적으로 발행되었습니다.' };
  }
}
