import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class CreatePhotospotDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumberString()
  latitude: number;

  @IsNotEmpty()
  @IsNumberString()
  longitude: number;
}
