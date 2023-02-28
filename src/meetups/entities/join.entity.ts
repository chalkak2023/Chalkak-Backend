import { User } from 'src/auth/entities/user.entity';
import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Meetup } from './meetup.entity';

@Entity({ schema: 'chalkak', name: 'join' })
export class Join {
  @PrimaryColumn()
  meetupId: number;

  @PrimaryColumn()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne((type) => Meetup, (meetup) => meetup.joins)
  meetup: Meetup;

  @ManyToOne((type) => User, (user) => user.joins)
  user: User;
}
