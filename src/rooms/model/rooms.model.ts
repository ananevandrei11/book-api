import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type RoomsDocument = HydratedDocument<RoomsModel>;

export enum HotelRoomType {
  Single = 'SINGLE',
  Double = 'DOUBLE',
  Triple = 'TRIPLE',
}

@Schema({ timestamps: true })
export class RoomsModel {
  @Prop()
  number: number;
  @Prop({ enum: HotelRoomType })
  type: HotelRoomType;
  @Prop()
  seaView: boolean;
}

export const RoomsSchema = SchemaFactory.createForClass(RoomsModel);