import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class ModifyPhotospotDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  deletePhotos: [];
}
