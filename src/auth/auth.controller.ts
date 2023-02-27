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
    return await this.authService.signUp(body);
  }

  @Post('signin')
  async signIn(@Body() body: SignInBodyDTO) {
    return await this.authService.signUp(body);
  }

  @Post('signout')
  async signOut() {
    return await this.authService.signOut();
  }

  @Post('emailverification')
  async postEmailVerification(@Body() body: PostEmailVerificationBodyDTO) {
    return await this.authService.postEmailVerification(body);
  }

  @Put('emailverification')
  async putEmailVerification(@Body() body: PutEmailVerificationBodyDTO) {
    return await this.authService.putEmailVerification(body);
  }

  @Patch('password')
  async changePassword(@Body() body: ChangePasswordBodyDTO) {
    return await this.authService.changePassword(body);
  }

  @Post('oauth/signin')
  async oauthSignIn() {
    return await this.authService.oauthSignIn();
  }
}
