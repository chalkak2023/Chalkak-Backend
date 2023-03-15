import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxDate, MaxLength, Min, MinDate } from "class-validator";

export class CreateMeetupDTO {
  @IsNumber()
  @IsOptional()
  userId?: number;

  @IsNotEmpty({ message: '모임 제목은 빈 문자열이 아니어야 합니다.' })
  @IsString({ message: '모임 제목은 문자열이어야 합니다.' })
  @MaxLength(12, { message: '모임 제목은 12글자 이내여야합니다.' })
  readonly title: string;
  
  @IsNotEmpty({ message: '모임 내용은 빈 문자열이 아니어야 합니다.' })
  @IsString({ message: '모임 내용은 문자열이어야 합니다.' })
  @MaxLength(255, { message: '모임 내용은 255글자 이내여야합니다.' })
  readonly content: string;
  
  @IsNotEmpty({ message: '장소는 빈 문자열이 아니어야 합니다.' })
  @IsString({ message: '장소는 문자열이어야 합니다.' })
  @MaxLength(8, { message: '장소는 8글자 이내여야합니다.' })
  readonly place: string;

  @Type(() => Date)
  @IsDate()
  @MinDate(new Date(), { message: '현재 시각 기준 이후의 모임만 개설할 수 있습니다.' })
  @MaxDate(():Date => { 
    const now = new Date();
    return new Date(now.setMonth(now.getMonth() + 3));
  }, { message: '오늘 기준 3개월 안의 모임만 개설할 수 있습니다.' })
  readonly schedule: Date;

  @Type(() => Number)
  @IsNumber({ 
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 0
   }, { message: '모임 정원은 정수 값만 입력 가능합니다.' })
  @Min(2, { message: '모임 정원은 2명 이상이어야 합니다.' })
  @Max(8, { message: '모임 정원은 8명을 넘을 수 없습니다.' })
  readonly headcount: number;
}