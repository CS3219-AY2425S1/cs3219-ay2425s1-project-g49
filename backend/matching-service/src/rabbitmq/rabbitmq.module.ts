import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { RabbitMQController } from './rabbitmq.controller';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Module({
  providers: [RabbitMQService, EventEmitter2],
  controllers: [RabbitMQController],
})
export class RabbitMQModule {}
