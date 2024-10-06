import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionsModule } from './questions/questions.module';
import { ConfigModule } from '@nestjs/config';
  

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.DB_CLOUD_URI),
    QuestionsModule,
  ],
})
export class AppModule {}
