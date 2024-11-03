import { Controller, Post, Body, Sse, Param, MessageEvent } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { EnterQueueDto } from 'src/dto/EnterQueue.dto';
import { map, Observable, Subject, interval } from 'rxjs';
import { DeclineMatchDto } from 'src/dto/DeclineMatch.dto';
import { AcceptMatchDto } from 'src/dto/AcceptMatch.dto';
import { get } from 'http';
import { CollabRoomDto } from 'src/dto/CollabRoom.dto';
import { DeleteRoomDto } from 'src/dto/DeleteRoom.dto';
import { ValidateRoomDto } from 'src/dto/ValidateRoom.dto';

@Controller('matching')
export class RabbitMQController {
  constructor(private readonly matchingService: MatchingService) { }
  private matchUsers: Record<string, Subject<any>> = {};

  @Post('enter')
  sendMessage(@Body() enterQueueDto: EnterQueueDto) {
    this.matchingService.enterQueue(enterQueueDto);
    return { status: 'Enter queue successfully' };
  }

  @Post('consume')
  consumeMessages() {
    this.matchingService.consumeQueue();
    return { status: 'Started consuming queue' };
  }

  @Post('match_declined')
  handleDecline(@Body() declineMatchDto: DeclineMatchDto) {
    console.log("Decline Endpoint reached")
    this.matchingService.handleMatchDecline(declineMatchDto);
    return { status: 'Processing decline' };
  }

  @Post('match_accepted')
  handleAccept(@Body() acceptMatchDto: AcceptMatchDto) {
    console.log("Accept Endpoint reached")
    this.matchingService.handleMatchAccept(acceptMatchDto);
    return { status: 'Processing accept' };
  }

  // @Post('collab_room')
  // handleCollabRoom(@Body() collabRoomDto: CollabRoomDto) {
  //   console.log("Collab room endpoint reached");
  //   const room_id = this.matchingService.handleCollabRoom(collabRoomDto);
  //   return { room_id: room_id }
  // }


  // @Post('delete_room')
  // handleDeleteRoom(@Body() deleteRoomDto: DeleteRoomDto) {
  //   console.log("Delete room endpoint reached");
  //   const status = this.matchingService.handleDeleteRoom(deleteRoomDto);
  //   return { status: status };
  // }

  @Post('remove_user')
  async removeUser(@Body('userEmail') userEmail: string) {
    console.log(`Removing user: ${userEmail}`);
    const result = await this.matchingService.removeUserFromQueue(userEmail);
    return result ? { status: 'User removed successfully' } : { status: 'User not found in queue' };
  }

  @Sse(':userEmail')
  sse(@Param('userEmail') userEmail: string): Observable<any> {
    // console.log("sse called by ", userEmail)
    return this.matchingService.createSSEStream(userEmail);
  }
}
