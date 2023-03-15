import { IsNotEmpty, IsString, NotContains } from 'class-validator';

export class SignupAdminReqDto {
  @IsNotEmpty()
  @NotContains(' ')
  account: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  responsibility: string;
}
