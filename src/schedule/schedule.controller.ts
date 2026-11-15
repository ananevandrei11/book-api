import {
  Body,
  Controller,
  Delete,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/schedule.dto';
import { SCHEDULE_NOT_FOUND } from './constants/schedule.errors.constants';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(@Body() dto: CreateScheduleDto) {
    return this.scheduleService.create(dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deletedSchedule = await this.scheduleService.delete(id);
    if (!deletedSchedule) {
      throw new HttpException(SCHEDULE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
  }
}
