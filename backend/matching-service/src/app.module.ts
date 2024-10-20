import { Module } from '@nestjs/common';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [RabbitMQModule, ConfigModule.forRoot()],
  controllers: [],
  providers: [],
})
export class AppModule {}
