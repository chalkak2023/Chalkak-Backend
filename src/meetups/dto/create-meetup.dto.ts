import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateMeetupDto {
  @IsOptional()
  @IsNumber()
  userId: number;

  @IsString()
  readonly title: string;
  
  @IsString()
  readonly content: string;
  
  @IsString()
  readonly place: string;

  @IsString()
  readonly schedule: string;

  @IsNumber()
  readonly headcount: number;
}