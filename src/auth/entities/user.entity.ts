import { Collection } from 'src/collections/entities/collection.entity';
import { Photospot } from 'src/photospot/entities/photospot.entity';
import { Join } from 'src/meetups/entities/join.entity';
import { Meetup } from 'src/meetups/entities/meetup.entity';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CollectionKeyword } from 'src/collections/entities/collection.keyword.entity';

@Entity({ schema: 'chalkak', name: 'user' })
export class User {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { unique: true })
  email: string;

  @Column('varchar', { select: false })
  password: string;

  @Column('bool', { default: false })
  isBlock: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @OneToMany((type) => Collection, (collection) => collection.user)
  collections: Collection[];

  @OneToMany((type) => CollectionKeyword, (collection_keyword) => collection_keyword.user)
  collection_keywords: Collection[];

  @OneToMany((type) => Photospot, (photospot) => photospot.user)
  photospots: Photospot[];

  @OneToMany((type) => Meetup, (meetup) => meetup.user)
  meetups: Meetup[];

  @OneToMany((type) => Join, (join) => join.user)
  joins: Join[];
}
