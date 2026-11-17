import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RoomsDocument, RoomsModel } from './model/rooms.model';
import { Error as MongooseError, Model } from 'mongoose';
import { CreateRoomDto, UpdateRoomDto } from './dto/room.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(RoomsModel.name) private roomModel: Model<RoomsModel>,
  ) {}

  async create(dto: CreateRoomDto): Promise<RoomsDocument> {
    try {
      return await this.roomModel.create(dto);
    } catch (e) {
      this.handleWriteError(e);
      throw e;
    }
  }

  async update(id: string, dto: UpdateRoomDto): Promise<RoomsDocument | null> {
    try {
      return await this.roomModel.findByIdAndUpdate(id, dto, { returnDocument: 'after', runValidators: true }).exec();
    } catch (e) {
      this.handleWriteError(e);
      throw e;
    }
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

  private handleWriteError(e: unknown): void {
    if (e instanceof MongooseError.ValidationError) {
      throw new BadRequestException({
        statusCode: 400,
        message: Object.values(e.errors).map((err) => err.message),
        error: 'Validation',
      });
    }
  }
}
