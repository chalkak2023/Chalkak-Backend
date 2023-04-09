import { IsNotEmpty, IsString, NotContains } from 'class-validator';

export class SignupAdminReqDto {
  @IsNotEmpty()
  @IsString()
  @NotContains(' ')
  account: string;

  @IsNotEmpty()
  @IsString()
  @NotContains(' ')
  password: string;

  @IsNotEmpty()
  @IsString()
  @NotContains(' ')
  responsibility: string;
}
