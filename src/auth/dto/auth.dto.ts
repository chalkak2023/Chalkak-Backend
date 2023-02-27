import { PickType } from '@nestjs/mapped-types';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignUpBodyDTO {
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class SignInBodyDTO extends PickType(SignUpBodyDTO, ['email', 'password']) {}

export class PostEmailVerificationBodyDTO extends PickType(SignUpBodyDTO, ['email']) {}

export class PutEmailVerificationBodyDTO extends PickType(SignUpBodyDTO, ['email']) {}

export class ChangePasswordBodyDTO extends PickType(SignUpBodyDTO, ['password']) {}
