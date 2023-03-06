import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCollectionDto {
  userId: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsArray()
  @IsNotEmpty({
    each: true,
  })
  @IsString({
    each: true,
  })
  keyword: string[];
}
