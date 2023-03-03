import { IsNotEmpty } from 'class-validator';

export class SigninAdminDto {
  id: number;

  @IsNotEmpty()
  account: string;

  @IsNotEmpty()
  password: string;
}
