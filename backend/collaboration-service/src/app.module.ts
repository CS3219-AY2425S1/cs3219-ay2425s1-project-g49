import { Module } from '@nestjs/common';
import { CollaborationGateway } from './gateways/collaboration.gateway';
import { CollaborationModule } from './collaboration/collaboration.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionsModule } from './questions/questions.module';
import { UsersModule } from './users/users.module';


@Module({
  imports: [CollaborationModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.DB_CLOUD_URI),
    QuestionsModule,
    UsersModule
  ],
  controllers: [],
  providers: [CollaborationGateway],
})
export class AppModule { }
