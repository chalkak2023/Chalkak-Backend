import { Type } from "class-transformer";
import { IsDate, IsNumber, IsString } from "class-validator";

export class ChatDTO {
  @IsNumber()
  userId: number;

  @IsString()
  readonly username: string;
  
  @IsString()
  readonly message: string;
  
  @Type(() => Date)
  @IsDate()
  readonly createdAt: Date;
}