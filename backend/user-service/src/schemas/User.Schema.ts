import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

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
  questions?: number[];
}

export const UserSchema = SchemaFactory.createForClass(User);
