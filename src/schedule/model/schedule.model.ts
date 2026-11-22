import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MSchema } from 'mongoose';
import { RoomsModel } from '../../rooms/model/rooms.model';
import { UsersModel } from '../../users/model/users.model';

export type ScheduleDocument = HydratedDocument<ScheduleModel>;

// 'YYYY-MM-DD' and a real calendar date (rejects 2024-02-31, 2024-13-45)
const isValidDate = (value: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !isNaN(Date.parse(value)) &&
  new Date(value).toISOString().startsWith(value);

@Schema({ timestamps: true })
export class ScheduleModel {
  @Prop({ type: MSchema.Types.ObjectId, ref: RoomsModel.name, required: true })
  roomId: Types.ObjectId;

  @Prop({ type: MSchema.Types.ObjectId, ref: UsersModel.name, required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, validate: isValidDate })
  date: string;
}

export const ScheduleSchema = SchemaFactory.createForClass(ScheduleModel);
ScheduleSchema.index({ roomId: 1, date: 1 }, { unique: true });
