import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateCollectionDto } from './create.collection.dto';

export class UpdateCollectionContentDto extends PartialType(PickType(CreateCollectionDto, ['title', 'description'] as const)) {}
