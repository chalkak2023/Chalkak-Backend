import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Collection } from 'src/collections/entities/collection.entity';

@Entity({ schema: 'chalkak', name: 'collection_keyword' })
export class CollectionKeyword {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { unique: true })
  keyword: string;

  @ManyToMany(() => Collection, (collection) => collection.collectionKeywords, {
  })
  collections: Collection[];
}
