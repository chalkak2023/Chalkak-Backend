import { IntersectionType, PickType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class SignUpBodyDTO {
  @IsEmail()
  email: string;
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 0,
    minNumbers: 0,
    minSymbols: 0,
    minUppercase: 0,
  })
  password: string;
}

export class VerifyTokenDTO {
  @IsNotEmpty()
  @Type(() => Number)
  verifyToken: number;
}

export class SignInBodyDTO extends PickType(SignUpBodyDTO, ['email', 'password']) {}

export class PostEmailVerificationBodyDTO extends PickType(SignUpBodyDTO, ['email']) {}

export class PutEmailVerificationBodyDTO extends IntersectionType(PickType(SignUpBodyDTO, ['email']), VerifyTokenDTO) {}

export class ChangePasswordBodyDTO extends PickType(SignUpBodyDTO, ['password']) {}
