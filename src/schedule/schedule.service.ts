import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ScheduleDocument, ScheduleModel } from './model/schedule.model';
import { Error as MongooseError, Model, Types, mongo } from 'mongoose';
import { CreateScheduleDto, UpdateScheduleDto } from './dto/schedule.dto';
import { SCHEDULE_ROOM_ALREADY_BOOKED } from './constants/schedule.errors.constants';
import { RoomsService } from '../rooms/rooms.service';
import { ROOM_NOT_FOUND } from '../rooms/constants/rooms.errors.constants';
import { INVALID_ID } from '../pipes/id-validation.pipe';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(ScheduleModel.name)
    private scheduleModel: Model<ScheduleModel>,
    private readonly roomsService: RoomsService,
  ) {}

  async create(
    dto: CreateScheduleDto,
    userId: string,
  ): Promise<ScheduleDocument> {
    await this.checkRoomExists(dto.roomId);
    try {
      return await this.scheduleModel.create({ ...dto, userId });
    } catch (e) {
      this.handleWriteError(e);
      throw e;
    }
  }

  async update(
    id: string,
    dto: UpdateScheduleDto,
    userId: string,
  ): Promise<ScheduleDocument | null> {
    if (dto.roomId !== undefined) {
      await this.checkRoomExists(dto.roomId);
    }
    try {
      return await this.scheduleModel
        .findOneAndUpdate({ _id: id, userId }, dto, {
          returnDocument: 'after',
          runValidators: true,
        })
        .exec();
    } catch (e) {
      this.handleWriteError(e);
      throw e;
    }
  }

  delete(id: string, userId: string): Promise<ScheduleDocument | null> {
    return this.scheduleModel.findOneAndDelete({ _id: id, userId }).exec();
  }

  findById(id: string): Promise<ScheduleDocument | null> {
    return this.scheduleModel.findById(id).exec();
  }

  findAll(): Promise<ScheduleDocument[]> {
    return this.scheduleModel.find().exec();
  }

  private async checkRoomExists(roomId: string): Promise<void> {
    if (!Types.ObjectId.isValid(roomId)) {
      throw new BadRequestException(INVALID_ID);
    }
    const room = await this.roomsService.findRoomById(roomId);
    if (!room) {
      throw new NotFoundException(ROOM_NOT_FOUND);
    }
  }

  private handleWriteError(e: unknown): void {
    if (e instanceof mongo.MongoServerError && e.code === 11000) {
      throw new ConflictException(SCHEDULE_ROOM_ALREADY_BOOKED, {
        cause: e,
        description: 'Schedule conflict',
      });
    }
    if (e instanceof MongooseError.ValidationError) {
      throw new BadRequestException({
        statusCode: 400,
        message: Object.values(e.errors).map((err) => err.message),
        error: 'Validation',
      });
    }
  }
}
