import { Collection } from 'src/collections/entities/collection.entity';
import { Photospot } from 'src/photospot/entities/photospot.entity';
import { Join } from 'src/meetups/entities/join.entity';
import { Meetup } from 'src/meetups/entities/meetup.entity';
import {
  ChildEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  TableInheritance,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ schema: 'chalkak', name: 'user' })
@TableInheritance({ column: { type: 'varchar', name: 'provider' } })
@Unique('provider_userid_unique', ['provider', 'providerUserId'])
export class User {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { unique: true, nullable: true })
  email: string;

  @Column('varchar', { unique: true })
  username: string;

  @Column('bool', { default: false })
  isBlock: boolean;

  @Column('varchar', { nullable: true })
  providerUserId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @OneToMany((type) => Collection, (collection) => collection.user)
  collections: Collection[];

  @OneToMany((type) => Photospot, (photospot) => photospot.user)
  photospots: Photospot[];

  @OneToMany((type) => Meetup, (meetup) => meetup.user)
  meetups: Meetup[];

  @OneToMany((type) => Join, (join) => join.user)
  joins: Join[];
}

@ChildEntity('local')
export class LocalUser extends User {
  @Column('varchar', { select: false })
  password: string;
}

@ChildEntity('naver')
export class NaverUser extends User {}

@ChildEntity('kakao')
export class KakaoUser extends User {}
