import { User } from 'src/auth/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Photospot } from 'src/photospot/entities/photospot.entity';
import { CollectionKeyword } from './collection.keyword.entity';

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

  @ManyToOne((type) => User, (user) => user.collections)
  user: User;

  @OneToMany((type) => Photospot, (photospot) => photospot.collection)
  photospots: Photospot[];

  @OneToMany((type) => CollectionKeyword, (collection_keyword) => collection_keyword.collection, {
    cascade: true,
  })
  collection_keywords: CollectionKeyword[];
}
