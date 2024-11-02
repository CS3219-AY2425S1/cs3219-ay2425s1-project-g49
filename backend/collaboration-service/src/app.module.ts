import { Module } from '@nestjs/common';
import { CollaborationGateway } from './gateways/collaboration.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [CollaborationGateway],
})
export class AppModule {}
