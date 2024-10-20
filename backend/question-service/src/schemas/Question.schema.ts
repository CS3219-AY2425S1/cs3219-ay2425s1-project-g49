import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class Question {
  @Prop({ unique: true, required: true })
  id: number;

  @Prop({ unique: true, required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  categories: string;

  @Prop({ required: true })
  complexity: string;

  @Prop({ required: true })
  link: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
