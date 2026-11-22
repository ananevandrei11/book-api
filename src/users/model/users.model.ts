import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UsersDocument = HydratedDocument<UsersModel>;

export enum UserRoleType {
  User = 'user',
  Admin = 'admin',
}

@Schema({ timestamps: true })
export class UsersModel {
  @Prop({ unique: true })
  email: string;
  @Prop()
  passwordHash: string;
  @Prop()
  firstName: string;
  @Prop()
  lastName: string;
  @Prop()
  phone: string;
  @Prop({ enum: UserRoleType })
  role: UserRoleType;
}

export const UsersSchema = SchemaFactory.createForClass(UsersModel);
