import { Body, Controller, Get, HttpCode, Param, Patch, Post, Put, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  PostEmailVerificationBodyDTO as PostSignupEmailVerificationBodyDTO,
  SignInBodyDTO,
  SignUpBodyDTO,
  PutEmailVerificationBodyDTO as PutSignupEmailVerificationBodyDTO,
  ChangePasswordBodyDTO,
  ProviderDTO,
  decodedAccessTokenDTO,
  PutChangePasswordVerificationBodyDTO,
} from './dto/auth.dto';
import { InjectUser, Token, UserGuard } from './auth.decorator';
import { JwtRefreshGuard } from './guard/jwt-refresh/jwt-refresh.guard';
import { SocialLoginBodyDTO } from './dto/auth.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() body: SignUpBodyDTO) {
    return await this.authService.signUp(body);
  }

  @Post('signin')
  @HttpCode(200)
  async signIn(@Body() body: SignInBodyDTO) {
    return await this.authService.signIn(body);
  }

  @Post('signout')
  @UserGuard
  @HttpCode(200)
  async signOut(@InjectUser() user: decodedAccessTokenDTO) {
    return await this.authService.signOut(user);
  }

  @Post('emailverification/signup')
  async postSignupEmailVerification(@Body() body: PostSignupEmailVerificationBodyDTO) {
    return await this.authService.postSignupEmailVerification(body);
  }

  @Put('emailverification/signup')
  async putSignupEmailVerification(@Body() body: PutSignupEmailVerificationBodyDTO) {
    return await this.authService.putSignupEmailVerification(body);
  }

  @Patch('')
  @UserGuard
  async changePassword(@Body() body: ChangePasswordBodyDTO, @InjectUser() user: decodedAccessTokenDTO) {
    return await this.authService.changePassword(body, user);
  }

  @Post('emailverification/password')
  @UserGuard
  async postChangePasswordEmailVerification(@InjectUser() user: decodedAccessTokenDTO) {
    return await this.authService.postChangePasswordEmailVerification(user);
  }

  @Put('emailverification/password')
  @UserGuard
  async putChangePasswordEmailVerification(@Body() body: PutChangePasswordVerificationBodyDTO, @InjectUser() user: decodedAccessTokenDTO) {
    return await this.authService.putChangePasswordEmailVerification(body, user);
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

  @Get('islogin')
  @UserGuard
  isLogin() {
    return true;
  }
}
