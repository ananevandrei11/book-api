import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ScheduleDocument, ScheduleModel } from './model/schedule.model';
import { Model, mongo } from 'mongoose';
import { CreateScheduleDto, UpdateScheduleDto } from './dto/schedule.dto';
import { SCHEDULE_ROOM_ALREADY_BOOKED } from './constants/schedule.errors.constants';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(ScheduleModel.name)
    private scheduleModel: Model<ScheduleModel>,
  ) {}

  async create(dto: CreateScheduleDto): Promise<ScheduleDocument> {
    try {
      return await this.scheduleModel.create(dto);
    } catch (e) {
      this.throwIfDuplicate(e);
      throw e;
    }
  }

  async update(id: string, dto: UpdateScheduleDto): Promise<ScheduleDocument | null> {
    try {
      return await this.scheduleModel
        .findByIdAndUpdate(id, dto, { returnDocument: 'after' })
        .exec();
    } catch (e) {
      this.throwIfDuplicate(e);
      throw e;
    }
  }

  delete(id: string): Promise<ScheduleDocument | null> {
    return this.scheduleModel.findByIdAndDelete(id).exec();
  }

  findById(id: string): Promise<ScheduleDocument | null> {
    return this.scheduleModel.findById(id).exec();
  }

  findAll(): Promise<ScheduleDocument[]> {
    return this.scheduleModel.find().exec();
  }

  private throwIfDuplicate(e: unknown): void {
    if (e instanceof mongo.MongoServerError && e.code === 11000) {
      throw new ConflictException(SCHEDULE_ROOM_ALREADY_BOOKED);
    }
  }
}
