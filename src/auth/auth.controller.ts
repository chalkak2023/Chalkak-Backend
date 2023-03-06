import { Body, Controller, Get, HttpCode, Param, Patch, Post, Put, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  PostEmailVerificationBodyDTO,
  SignInBodyDTO,
  SignUpBodyDTO,
  PutEmailVerificationBodyDTO,
  ChangePasswordBodyDTO,
  ProviderDTO,
} from './dto/auth.dto';
import { InjectUser, Token, UserGuard } from './auth.decorator';
import { JwtRefreshGuard } from './guard/jwt-refresh/jwt-refresh.guard';
import { SocialLoginBodyDTO } from './dto/auth.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sample')
  async createSampleUser() {
    return await this.authService.createSampleUser();
  }

  @Post('signup')
  async signUp(@Body() body: SignUpBodyDTO) {
    return await this.authService.signUp(body);
  }

  @Post('signin')
  @HttpCode(200)
  async signIn(@Body() body: SignInBodyDTO, @Res({ passthrough: true }) response: any) {
    return await this.authService.signIn(body, response);
  }

  @Post('signout')
  @UseGuards(UserGuard)
  @HttpCode(200)
  async signOut(@InjectUser() user: any, @Res({ passthrough: true }) response: any) {
    return await this.authService.signOut(user, response);
  }

  @Post('emailverification')
  async postEmailVerification(@Body() body: PostEmailVerificationBodyDTO) {
    return await this.authService.postEmailVerification(body);
  }

  @Put('emailverification')
  async putEmailVerification(@Body() body: PutEmailVerificationBodyDTO) {
    return await this.authService.putEmailVerification(body);
  }

  @Patch('')
  @UseGuards(UserGuard)
  async changePassword(@Body() body: ChangePasswordBodyDTO, @InjectUser() user: any) {
    return await this.authService.changePassword(body, user);
  }

  @Post('oauth/signin/:provider')
  @HttpCode(200)
  async oauthSignIn(@Param() params: ProviderDTO, @Body() body: SocialLoginBodyDTO) {
    const { provider } = params;
    return await this.authService.oauthSignIn(provider, body);
  }

  @Get('refresh')
  @UseGuards(JwtRefreshGuard)
  async refreshAccessToken(@Token('accessToken') accessToken: string, @Token('refreshToken') refreshToken: string) {
    return await this.authService.refreshAccessToken(accessToken, refreshToken);
  }
}
