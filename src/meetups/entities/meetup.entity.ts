import { User } from 'src/auth/entities/user.entity';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Join } from './join.entity';

@Entity({ schema: 'chalkak', name: 'meetup' })
export class Meetup {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int')
  userId: number;

  @Column('varchar')
  title: string;

  @Column('varchar')
  content: string;

  @Column('varchar')
  place: string;

  @Column('datetime')
  schedule: Date;

  @Column('int')
  headcount: number;

  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @ManyToOne(() => User, (user) => user.meetups)
  user: User;

  @OneToMany(() => Join, (join) => join.meetup, {
    cascade: true,
  })
  joins: Join[];
}
