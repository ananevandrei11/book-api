import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RoomsDocument, RoomsModel } from './model/rooms.model';
import { Model } from 'mongoose';
import { CreateRoomDto, UpdateRoomDto } from './dto/room.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(RoomsModel.name) private roomModel: Model<RoomsModel>,
  ) {}

  create(dto: CreateRoomDto): Promise<RoomsDocument> {
    return this.roomModel.create(dto);
  }

  update(id: string, dto: UpdateRoomDto): Promise<RoomsDocument | null> {
    return this.roomModel.findByIdAndUpdate(id, dto, { returnDocument: 'after', runValidators: true }).exec();
  }

  delete(id: string): Promise<RoomsDocument | null> {
    return this.roomModel.findByIdAndDelete(id).exec();
  }

  findRoomById(id: string): Promise<RoomsDocument | null> {
    return this.roomModel.findById(id).exec();
  }

  findAll(): Promise<RoomsDocument[]> {
    return this.roomModel.find().exec();
  }
}
