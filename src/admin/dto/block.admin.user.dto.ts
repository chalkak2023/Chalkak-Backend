import { IsBoolean } from 'class-validator';

export class BlockAdminUserDto {
  id: number;

  @IsBoolean()
  isBlock: boolean;
}
