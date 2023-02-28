import { IntersectionType, PickType } from '@nestjs/mapped-types';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignUpBodyDTO {
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class VerifyTokenDTO {
  @IsNotEmpty()
  verifyToken: string | number;
}

export class SignInBodyDTO extends PickType(SignUpBodyDTO, ['email', 'password']) {}

export class PostEmailVerificationBodyDTO extends PickType(SignUpBodyDTO, ['email']) {}

export class PutEmailVerificationBodyDTO extends IntersectionType(PickType(SignUpBodyDTO, ['email']), VerifyTokenDTO) {}

export class ChangePasswordBodyDTO extends PickType(SignUpBodyDTO, ['password']) {}
