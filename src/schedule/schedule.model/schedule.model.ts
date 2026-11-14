import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MSchema } from 'mongoose';
import { RoomsModel } from '../../rooms/model/rooms.model';

export type CatDocument = HydratedDocument<ScheduleModel>;

export enum ScheduleStatus {
  Vacant = 'VACANT',
  Occupied = 'OCCUPIED',
  Reserved = 'RESERVED',
  Cancelled = 'CANCELLED',
}

@Schema({ timestamps: true })
export class ScheduleModel {
  @Prop({ type: MSchema.Types.ObjectId, ref: RoomsModel.name, required: true })
  roomId: Types.ObjectId;

  // 'YYYY-MM-DD'
  @Prop({ required: true, match: /^\d{4}-\d{2}-\d{2}$/ })
  date: string;

  @Prop({ enum: ScheduleStatus })
  status: ScheduleStatus;
}

export const ScheduleSchema = SchemaFactory.createForClass(ScheduleModel);
