import { PickType } from '@nestjs/mapped-types';
import { CreateCollectionDto } from './create.collection.dto';

export class UpdateCollectionKeywordDto extends PickType(CreateCollectionDto, ['keyword'] as const) {}
