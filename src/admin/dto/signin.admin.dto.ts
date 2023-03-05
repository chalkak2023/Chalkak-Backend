import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SigninAdminDto {
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  account: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
