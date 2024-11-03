import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';


export interface Question {
  id: number;
  solution: string;
  time: string;
}

@Schema()
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  avatarUrl?: string;

  @Prop({ required: false })
  displayName?: string;

  @Prop({ required: false })
  questions?: Question[];
}

export const UserSchema = SchemaFactory.createForClass(User);
