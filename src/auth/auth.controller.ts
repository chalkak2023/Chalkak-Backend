import { Body, Controller, Patch, Post, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  PostEmailVerificationBodyDTO,
  SignInBodyDTO,
  SignUpBodyDTO,
  PutEmailVerificationBodyDTO,
  ChangePasswordBodyDTO,
} from './dto/auth.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sample')
  async createSampleUser() {
    return await this.authService.createSampleUser();
  }

  @Post('signup')
  async signUp(@Body() body: SignUpBodyDTO) {
    return await this.authService.signUp();
  }

  @Post('signin')
  async signIn(@Body() body: SignInBodyDTO) {
    return await this.authService.signUp();
  }

  @Post('signout')
  async signOut() {
    return await this.authService.signOut();
  }

  @Post('emailverification')
  async postEmailVerification(@Body() body: PostEmailVerificationBodyDTO) {
    return await this.authService.postEmailVerification();
  }

  @Put('emailverification')
  async putEmailVerification(@Body() body: PutEmailVerificationBodyDTO) {
    return await this.authService.putEmailVerification();
  }

  @Patch('password')
  async changePassword(@Body() body: ChangePasswordBodyDTO) {
    return await this.authService.changePassword();
  }

  @Post('oauth/signin')
  async oauthSignIn() {
    return await this.authService.oauthSignIn();
  }
}
