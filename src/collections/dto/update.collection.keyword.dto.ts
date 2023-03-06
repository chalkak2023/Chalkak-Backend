import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCollectionKeywordDto {
  userId: number;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  keyword: string;
}
