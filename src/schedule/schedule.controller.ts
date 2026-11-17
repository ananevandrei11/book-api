import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto, UpdateScheduleDto } from './dto/schedule.dto';
import { SCHEDULE_NOT_FOUND } from './constants/schedule.errors.constants';
import { IdValidationPipe } from '../pipes/id-validation.pipe';
import { validationExceptionFactory } from '../pipes/validation-exception.factory';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @UsePipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: validationExceptionFactory,
    }),
  )
  @Post()
  create(@Body() dto: CreateScheduleDto) {
    return this.scheduleService.create(dto);
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      skipMissingProperties: true,
      exceptionFactory: validationExceptionFactory,
    }),
  )
  @Patch(':id')
  async update(
    @Param('id', IdValidationPipe) id: string,
    @Body() dto: UpdateScheduleDto,
  ) {
    const updatedSchedule = await this.scheduleService.update(id, dto);
    if (!updatedSchedule) {
      throw new HttpException(SCHEDULE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return updatedSchedule;
  }

  @Delete(':id')
  async delete(@Param('id', IdValidationPipe) id: string) {
    const deletedSchedule = await this.scheduleService.delete(id);
    if (!deletedSchedule) {
      throw new HttpException(SCHEDULE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
  }

  @Get(':id')
  async findById(@Param('id', IdValidationPipe) id: string) {
    const schedule = await this.scheduleService.findById(id);
    if (!schedule) {
      throw new HttpException(SCHEDULE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return schedule;
  }

  @Get()
  findAll() {
    return this.scheduleService.findAll();
  }
}
