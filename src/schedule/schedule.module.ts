import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModel, ScheduleSchema } from './model/schedule.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ScheduleModel.name, schema: ScheduleSchema, collection: 'schedule' },
    ]),
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}
