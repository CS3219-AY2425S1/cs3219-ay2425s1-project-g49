import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket} from 'socket.io'

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }
  
  @SubscribeMessage('joinRoom')
  handleJoinSession(client: Socket, roomId: string) {
    client.join(roomId);
    console.log(`Client ${client.id} joined room: ${roomId}`);
  }

  @SubscribeMessage('send')
  handleSendMessage(client: Socket, data: { roomId: string; msg: string }) {
    client.to(data.roomId).emit('receive', data);
  }
}
