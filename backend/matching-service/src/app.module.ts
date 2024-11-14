import { Module } from '@nestjs/common';
import { MatchingModule } from './matching/matching.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [MatchingModule, ConfigModule.forRoot()],
  controllers: [],
  providers: [],
})
export class AppModule {}
