import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RoomsDocument, RoomsModel } from './model/rooms.model';
import { DeleteResult, Model, UpdateWriteOpResult } from 'mongoose';
import { CreateRoomDto, UpdateRoomDto } from './dto/room.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(RoomsModel.name) private roomModel: Model<RoomsModel>,
  ) {}

  async create(dto: CreateRoomDto): Promise<RoomsDocument> {
    return this.roomModel.create(dto);
  }

  async update(id: string, dto: UpdateRoomDto): Promise<RoomsDocument | null> {
    return this.roomModel.findByIdAndUpdate(id, dto).exec();
  }

  async delete(id: string): Promise<RoomsDocument | null> {
    return this.roomModel.findByIdAndDelete(id).exec();
  }

  async findRoomById(id: string): Promise<RoomsDocument | null> {
    return this.roomModel.findById(id).exec();
  }
}
