import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'chalkak', name: 'chat' })
export class Chat {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  // 채팅방을 만드는 socket.join()에 stirng 밖에 올 수 없는 특수성으로 인해
  // number가 아닌 string으로 세팅
  @Column('varchar')
  roomId: string;

  @Column('int')
  userId: number;

  @Column('varchar')
  username: string;

  @Column('varchar')
  message: string;

  @CreateDateColumn()
  createdAt: Date;
}
