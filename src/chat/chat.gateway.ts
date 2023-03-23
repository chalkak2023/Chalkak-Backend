import _ from 'lodash';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { ChatDTO, JoinLeaveChatDTO } from './dto/chat.dto';

let createdRooms: string[] = [];

@WebSocketGateway({
  namespace: 'chat',
  cors: true
  // cors: { origin: ['http://localhost:3000'] },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() nsp: Namespace;

  // 초기화 이후에 실행
  afterInit() {
    this.nsp.adapter.on('delete-room', (roomId) => {

      const deletedRoom = createdRooms.find(
        (createdRoom) => createdRoom === roomId
      );
      if (!deletedRoom) return;

      this.nsp.emit('delete-room', deletedRoom);
      createdRooms = createdRooms.filter(
        (createdRoom) => createdRoom !== deletedRoom,
      );

      // console.log(`"Room:${roomId}"이 삭제되었습니다.`);
      // console.log(createdRooms);
    });

    console.log('웹소켓 서버 초기화 ✅');
  }

  // 소켓이 연결되면 실행
  handleConnection(@ConnectedSocket() socket: Socket) {
    // console.log(`${socket.id} 소켓 연결`);

    // const alert = { message: `${socket.id}가 들어왔습니다.` };
    // socket.broadcast.emit('alert', { alert });
  }

  // 소켓 연결이 끊기면 실행
  handleDisconnect(@ConnectedSocket() socket: Socket) {
    // console.log(`${socket.id} 소켓 연결 해제 ❌`);

    // const alert = { message: `${socket.id}가 나갔습니다.` };
    // socket.broadcast.emit('alert', { alert });
  }

  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() chatObj: ChatDTO,
  ) {
    socket.broadcast
      .to(chatObj.roomId)
      .emit('message', chatObj);
    return chatObj;
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() chatObj: JoinLeaveChatDTO,
  ) {
    const exists = createdRooms.find((createdRoom) => createdRoom === chatObj.roomId);
    if (!exists) {
      createdRooms.push(chatObj.roomId);
    }
    socket.join(chatObj.roomId); 

    const alertObj: ChatDTO = {
      roomId: chatObj.roomId,
      userId: 0,
      username: '[system]',
      message: `${chatObj.username}님이 들어왔습니다.`,
      createdAt: new Date()
    }
    this.nsp
      .to(chatObj.roomId)
      .emit('alert', alertObj, this.countNumberOfRoom(chatObj.roomId));
    return { success: true, payload: chatObj.roomId };
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() chatObj: JoinLeaveChatDTO,
    ) {
    socket.leave(chatObj.roomId);

    const alertObj: ChatDTO = {
      roomId: chatObj.roomId,
      userId: 0,
      username: '[system]',
      message: `${chatObj.username}님이 나갔습니다.`,
      createdAt: new Date()
    }
    socket.broadcast
      .to(chatObj.roomId)
      .emit('alert', alertObj, this.countNumberOfRoom(chatObj.roomId));
    return { success: true };
  }

  countNumberOfRoom(roomId: string) {
    let num = this.nsp.adapter.rooms.get(roomId)?.size;
    if (_.isNil(num)) {
      num = 0;
    }
    return num;
  }
}