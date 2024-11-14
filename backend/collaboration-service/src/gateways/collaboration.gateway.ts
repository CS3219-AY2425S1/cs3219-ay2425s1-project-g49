import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
  },
})
export class CollaborationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinSession')
  handleJoinSession(client: Socket, sessionId: string) {
    client.join(sessionId);
    console.log(`Client ${client.id} joined session: ${sessionId}`);
  }

  @SubscribeMessage('edit')
  handleEdit(client: Socket, data: { sessionId: string; text: string }) {
    this.server.to(data.sessionId).emit('update', data);
  }
}
