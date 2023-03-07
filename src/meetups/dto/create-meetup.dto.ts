import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

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

  @IsString()
  readonly schedule: string;

  @Type(() => Number)
  @IsNumber()
  readonly headcount: number;
}