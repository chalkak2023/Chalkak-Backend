import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCollectionDto {
  userId: number;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  keyword: string;
}
