import { IsBoolean, IsString } from "class-validator";

export class SignupAdminResDto {
  @IsBoolean()
  successStatus: boolean;

  @IsString()
  message: string;
}
