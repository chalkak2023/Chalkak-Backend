import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'chalkak', name: 'admin' })
export class Admin {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Index({ unique: true })
  @Column('varchar')
  account: string;

  @Column('varchar', { select: false })
  password: string;

  @Column('varchar')
  responsibility: string;

  @Column({ type: 'varchar', nullable: true, name: 'refreshtoken' })
  refreshToken: string | null;

  @Column({ type: 'datetime', nullable: true, name: 'refreshtokenexp' })
  refreshTokenExp: string;

  @CreateDateColumn()
  createdAt: Date;
}
