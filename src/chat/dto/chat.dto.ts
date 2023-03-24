import { PickType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";
import { IsDate, IsNumber, IsString } from "class-validator";

export class ChatDTO {
  // @IsNumber()  
  // readonly roomId: number;
  // socket.join은 string만 받는데 meetupId (number) 로 전달해야 하므로 일단 stirng으로 변환되게 선언
  @IsString()  
  readonly roomId: string;

  @IsNumber()
  readonly userId: number;

  @IsString()
  readonly username: string;
  
  @IsString()
  readonly message: string;
  
  @Type(() => Date)
  @IsDate()
  readonly createdAt: Date;
}

export class JoinLeaveChatDTO extends PickType(ChatDTO, ['roomId', 'userId', 'username'] as const) {}