import { IsNotEmpty, IsString, NotContains } from 'class-validator';

export class SignupAdminReqDto {
  @IsNotEmpty()
  @NotContains(' ')
  account: string;

  @IsNotEmpty()
  @NotContains(' ')
  password: string;

  @IsNotEmpty()
  @NotContains(' ')
  responsibility: string;
}
