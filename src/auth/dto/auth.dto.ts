import { IntersectionType, PickType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsNumber, IsString, IsStrongPassword, IsIn } from 'class-validator';

export class SignUpBodyDTO {
  @IsOptional()
  @IsNotEmpty({
    message: '유저명은 빈문자열이면 안 됩니다.'
  })
  @IsString({
    message: '유저명은 문자열이어야 합니다.'
  })
  username?: string;
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
  readonly email: string;

  @IsString()
  readonly role: string;

  @IsNumber()
  readonly iat: number;

  @IsNumber()
  readonly exp: number;
}