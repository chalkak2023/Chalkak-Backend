import { IntersectionType, PickType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsNotEmpty, IsNumber, IsStrongPassword } from 'class-validator';

export class SignUpBodyDTO {
  @IsEmail(
    {},
    {
      message: 'email은 이메일의 형식이어야 합니다.',
    }
  )
  email: string;
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 0,
      minNumbers: 0,
      minSymbols: 0,
      minUppercase: 0,
    },
    {
      message: '비밀번호는 최소 8자리의 문자열이어야합니다.',
    }
  )
  password: string;
}

export class VerifyTokenDTO {
  @Type(() => Number)
  @IsInt({
    message: '이메일 인증토큰은 정수여야합니다.',
  })
  verifyToken: number;
}

export class SignInBodyDTO extends PickType(SignUpBodyDTO, ['email', 'password']) {}

export class PostEmailVerificationBodyDTO extends PickType(SignUpBodyDTO, ['email']) {}

export class PutEmailVerificationBodyDTO extends IntersectionType(PickType(SignUpBodyDTO, ['email']), VerifyTokenDTO) {}

export class ChangePasswordBodyDTO extends PickType(SignUpBodyDTO, ['password']) {}
