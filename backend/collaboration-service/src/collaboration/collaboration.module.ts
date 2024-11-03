import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CollaborationService } from './collaboration.service';
import { CollaborationController } from './collaboration.controller';
import { QuestionsModule } from 'src/questions/questions.module';
import { UsersModule } from 'src/users/users.module';
import { Question, QuestionSchema } from 'src/schemas/Question.schema';
import { User, UserSchema } from 'src/schemas/User.Schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
      { name: User.name, schema: UserSchema },
    ]),
    QuestionsModule,
    UsersModule,
  ],
  providers: [CollaborationService],
  controllers: [CollaborationController],
})
export class CollaborationModule { }
