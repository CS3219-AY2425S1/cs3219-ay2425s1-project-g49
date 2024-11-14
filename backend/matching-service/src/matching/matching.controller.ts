import { Controller, Post, Body, Sse, Param, MessageEvent } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { EnterQueueDto } from 'src/dto/EnterQueue.dto';
import { Observable, Subject } from 'rxjs';
import { DeclineMatchDto } from 'src/dto/DeclineMatch.dto';
import { AcceptMatchDto } from 'src/dto/AcceptMatch.dto';

@Controller('matching')
export class RabbitMQController {
  constructor(private readonly matchingService: MatchingService) { }

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
