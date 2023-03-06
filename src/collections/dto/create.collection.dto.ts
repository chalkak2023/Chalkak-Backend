import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

  @IsArray()
  @IsOptional()
  @IsNotEmpty({
    each: true,
  })
  @IsString({
    each: true,
  })
  keyword: string[];
}
