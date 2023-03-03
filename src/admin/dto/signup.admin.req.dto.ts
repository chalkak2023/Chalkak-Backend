import { IsNotEmpty, IsString } from 'class-validator';

export class SignupAdminReqDto {
  @IsNotEmpty()
  @IsString()
  account: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  responsibility: string;
}
