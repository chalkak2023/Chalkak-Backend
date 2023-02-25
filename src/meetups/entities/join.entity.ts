import { User } from 'src/auth/entities/user.entity';
import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Meetup } from './meetup.entity';

@Entity({ schema: 'chalkak', name: 'join' })
export class Join {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  meetupId: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne((type) => User, (user) => user.joins)
  user: User;

  @ManyToOne((type) => Meetup, (meetup) => meetup.joins)
  meetup: Meetup;
}
