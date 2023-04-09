import { IsBoolean, IsNumber } from 'class-validator';

export class BlockAdminUserDto {
  @IsNumber()
  id: number;

  @IsBoolean()
  isBlock: boolean;
}
