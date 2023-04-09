import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Collection } from '../../collections/entities/collection.entity';
import { User } from '../../auth/entities/user.entity';
import { Photo } from './photo.entity';

@Entity({ schema: 'chalkak', name: 'photospot' })
export class Photospot {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int')
  userId: number;

  @Column('int')
  collectionId: number;

  @Column('varchar')
  title: string;

  @Column('varchar')
  description: string;

  @Column('double')
  latitude: number;

  @Column('double')
  longitude: number;

  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
  
  @DeleteDateColumn()
  deletedAt: Date | null;

  @ManyToOne((type) => User, (user) => user.photospots)
  user: User;

  @ManyToOne((type) => Collection, (collection) => collection.photospots)
  collection: Collection;

  @OneToMany(() => Photo, (photo) => photo.photospot)
  photos: Photo[]
}
