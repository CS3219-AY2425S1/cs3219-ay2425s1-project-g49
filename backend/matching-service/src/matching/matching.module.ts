import { Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { RabbitMQController } from './matching.controller';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Module({
  providers: [MatchingService, EventEmitter2],
  controllers: [RabbitMQController],
})
export class MatchingModule {}
