import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddCollectionKeywordDto {
  userId: number;

  @IsNotEmpty()
  @IsString()
  keyword: string;
}
