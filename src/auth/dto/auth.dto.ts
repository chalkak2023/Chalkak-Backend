import { PickType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsNumber, IsString, IsStrongPassword, IsIn, MaxLength, NotContains } from 'class-validator';

export class SignUpBodyDTO {
  @IsNotEmpty({
    message: '유저명은 빈문자열이면 안 됩니다.'
  })
  @NotContains(' ', {
    message: '유저명은 공백이 없는 문자열이어야 합니다.'
  })
  @MaxLength(16, {
    message: '유저명은 16글자 이내여야합니다.'
  })
  username: string;
  @IsEmail(
    {},
    {
      message: 'email은 이메일의 형식이어야 합니다.',
    }
  )
  email: string;
  @NotContains(' ', {
    message: '비밀번호는 공백이 없는 문자열이어야합니다.'
  })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 0,
    },
    {
      message: '비밀번호는 최소 8자리의 문자열이며, 소문자, 숫자, 특수문자를 최소 1개씩은 포함해야합니다.',
    }
  )
  password: string;
  @Type(() => Number)
  @IsInt({
    message: '이메일 인증토큰은 정수여야합니다.',
  })
  verifyToken: number;
}

export class SignInBodyDTO extends PickType(SignUpBodyDTO, ['email']) {
  @IsNotEmpty({
    message: '비밀번호는 비어있으면 안 됩니다.'
  })
  @NotContains(' ', {
    message: '비밀번호는 공백이 없는 문자열이어야 합니다.'
  })
  password: string;
}

export class PostEmailVerificationBodyDTO extends PickType(SignUpBodyDTO, ['email']) {}

export class PutEmailVerificationBodyDTO extends PickType(SignUpBodyDTO, ['email', 'verifyToken']) {}

export class PutChangePasswordVerificationBodyDTO extends PickType(SignUpBodyDTO, ['verifyToken']) {}

export class ChangePasswordBodyDTO extends PickType(SignUpBodyDTO, ['password']) {}

export class ProviderDTO {
  @IsIn(['kakao', 'naver'], {
    message: '소셜 로그인은 kakao와 naver만 지원합니다.'
  })
  provider: 'kakao' | 'naver'
}

export class SocialLoginBodyDTO {
  @IsNotEmpty({
    message: 'code는 비어있으면 안 됩니다.'
  })
  @IsString({
    message: 'code는 문자열이어야 합니다.'
  })
  code: string;
  @IsOptional()
  @IsNotEmpty({
    message: 'state는 비어있으면 안 됩니다.'
  })
  @IsString({
    message: 'state는 문자열이어야 합니다.'
  })
  state?: string;
}

export class decodedAccessTokenDTO {
  @IsNumber()
  readonly id: number;

  @IsString()
  readonly username: string;

  @IsString()
  readonly email?: string;

  @IsString()
  readonly role: string;

  @IsNumber()
  readonly iat: number;

  @IsNumber()
  readonly exp: number;
}