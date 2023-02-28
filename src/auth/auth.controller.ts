import { Body, Controller, Patch, Post, Put, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  PostEmailVerificationBodyDTO,
  SignInBodyDTO,
  SignUpBodyDTO,
  PutEmailVerificationBodyDTO,
  ChangePasswordBodyDTO,
} from './dto/auth.dto';
import { JwtGuard } from 'src/common/auth/guard/jwt/jwt.guard';
import { InjectUser } from 'src/common/auth/auth.decorator';

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
  async signIn(@Body() body: SignInBodyDTO, @Res({ passthrough: true }) response: any) {
    return await this.authService.signIn(body, response);
  }

  @Post('signout')
  @UseGuards(JwtGuard)
  async signOut( @InjectUser() user: any) {
    return await this.authService.signOut(user);
  }

  @Post('emailverification')
  @UseGuards(JwtGuard)
  async postEmailVerification(@Body() body: PostEmailVerificationBodyDTO, @InjectUser() user: any) {
    return await this.authService.postEmailVerification(body, user);
  }

  @Put('emailverification')
  @UseGuards(JwtGuard)
  async putEmailVerification(@Body() body: PutEmailVerificationBodyDTO, @InjectUser() user: any) {
    return await this.authService.putEmailVerification(body, user);
  }

  @Patch('')
  @UseGuards(JwtGuard)
  async changePassword(@Body() body: ChangePasswordBodyDTO, @InjectUser() user: any) {
    return await this.authService.changePassword(body, user);
  }

  @Post('oauth/signin')
  async oauthSignIn() {
    return await this.authService.oauthSignIn();
  }
}
