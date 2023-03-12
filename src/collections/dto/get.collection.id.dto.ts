import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class GetCollectionIdDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  collectionId: number;
}
