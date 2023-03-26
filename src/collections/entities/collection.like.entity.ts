import { User } from 'src/auth/entities/user.entity';
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Collection } from './collection.entity';

@Entity({ schema: 'chalkak', name: 'collection_like' })
export class CollectionLike {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  collectionId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.collectionLikes, { cascade: true })
  user: User;

  @ManyToOne(() => Collection, (collection) => collection.collectionLikes, { cascade: true })
  collection: Collection;
}
