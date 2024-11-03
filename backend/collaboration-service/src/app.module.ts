import { Module } from '@nestjs/common';
import { CollaborationGateway } from './gateways/collaboration.gateway';
import { CollaborationModule } from './collaboration/collaboration.module';

@Module({
  imports: [CollaborationModule],
  controllers: [],
  providers: [CollaborationGateway],
})
export class AppModule {}
