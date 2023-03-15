import { Type } from "class-transformer";
import { IsDate, IsDateString, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateMeetupDTO {
  @IsNumber()
  @IsOptional()
  userId?: number;

  @IsString()
  readonly title: string;
  
  @IsString()
  readonly content: string;
  
  @IsString()
  readonly place: string;

  @Type(() => Date)
  @IsDate()
  readonly schedule: Date;

  @Type(() => Number)
  @IsNumber()
  @Min(2)
  @Max(8)
  readonly headcount: number;
}