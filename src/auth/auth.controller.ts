import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sample')
  async createSampleUser() {
    return await this.authService.createSampleUser();
  }
}
