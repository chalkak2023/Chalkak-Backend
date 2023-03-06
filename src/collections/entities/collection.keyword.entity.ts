import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Collection } from 'src/collections/entities/collection.entity';
import { User } from 'src/auth/entities/user.entity';

@Entity({ schema: 'chalkak', name: 'collection_keyword' })
export class CollectionKeyword {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @PrimaryColumn()
  collectionId: number;

  @PrimaryColumn()
  userId: number;

  @Column('varchar')
  keyword: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @ManyToOne(() => Collection, (collection) => collection.collection_keywords, {
    onDelete: 'CASCADE',
  })
  collection: Collection;

  @ManyToOne(() => User, (user) => user.collection_keywords)
  user: User;
}
