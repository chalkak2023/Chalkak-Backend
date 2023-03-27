import { PickType } from '@nestjs/mapped-types';
import { IsNumber } from 'class-validator';
import { SignupAdminReqDto } from './signup.admin.req.dto';

export class SigninAdminDto extends PickType(SignupAdminReqDto, ['account', 'password']) {
  @IsNumber()
  id: number;
}
