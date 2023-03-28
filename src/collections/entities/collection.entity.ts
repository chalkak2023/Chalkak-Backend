import { User } from 'src/auth/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Photospot } from 'src/photospot/entities/photospot.entity';
import { CollectionKeyword } from 'src/collections/entities/collection.keyword.entity';
import { CollectionLike } from 'src/collections/entities/collection.like.entity';

@Entity({ schema: 'chalkak', name: 'collection' })
export class Collection {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int')
  userId: number;

  @Column('varchar')
  title: string;

  @Column('varchar')
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @ManyToOne(() => User, (user) => user.collections)
  user: User;

  @OneToMany((type) => Photospot, (photospot) => photospot.collection, {
    cascade: true,
  })
  photospots: Photospot[];

  @OneToMany(() => CollectionLike, (collectionLike) => collectionLike.collection)
  collectionLikes: CollectionLike[];

  @ManyToMany(() => CollectionKeyword, (collectionKeyword) => collectionKeyword.collections, {
    cascade: true,
  })
  @JoinTable({ name: 'collection_keyword_connector' })
  collectionKeywords: CollectionKeyword[];
}
