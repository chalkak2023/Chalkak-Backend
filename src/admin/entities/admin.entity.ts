import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'chalkak', name: 'admin' })
export class Admin {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Index({ unique: true })
  @Column('varchar')
  account: string;

  @Column('varchar')
  password: string;

  @Column('varchar')
  responsibility: string;

  @CreateDateColumn()
  createdAt: Date;
}
