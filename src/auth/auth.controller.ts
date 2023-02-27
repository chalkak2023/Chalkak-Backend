import { Controller, Patch, Post, Put } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sample')
  async createSampleUser() {
    return await this.authService.createSampleUser();
  }

  @Post('signup')
  async signUp() {
    return await this.authService.signUp();
  }

  @Post('signin')
  async signIn() {
    return await this.authService.signUp();
  }

  @Post('signout')
  async signOut() {
    return await this.authService.signOut();
  }

  @Post('emailverification')
  async postEmailVerification() {
    return await this.authService.postEmailVerification();
  }

  @Put('emailverification')
  async putEmailVerification() {
    return await this.authService.putEmailVerification();
  }

  @Patch('password')
  async changePassword() {
    return await this.authService.changePassword();
  }

  @Post('oauth/signin')
  async oauthSignIn() {
    return await this.authService.oauthSignIn();
  }
}
