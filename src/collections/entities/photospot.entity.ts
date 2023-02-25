import { User } from 'src/auth/entities/user.entity';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Collection } from './collection.entity';

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

  @Column('varchar')
  imagePath: string;

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
}
