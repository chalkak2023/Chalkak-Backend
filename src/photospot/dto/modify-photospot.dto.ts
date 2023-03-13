import { IsNotEmpty, IsString } from 'class-validator';
export class ModifyPhotospotDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}
