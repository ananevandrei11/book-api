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
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto, UpdateScheduleDto } from './dto/schedule.dto';
import { SCHEDULE_NOT_FOUND } from './constants/schedule.errors.constants';
import { IdValidationPipe } from '../pipes/id-validation.pipe';
import { validationExceptionFactory } from '../pipes/validation-exception.factory';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRoleType } from '../users/model/users.model';
import { User } from '../decorators/user.decorator';
import { UsersPayloadDto } from '../users/dto/users.dto';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @UsePipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: validationExceptionFactory,
    }),
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRoleType.User])
  @Post()
  create(@Body() dto: CreateScheduleDto, @User() user: UsersPayloadDto) {
    return this.scheduleService.create(dto, user.id);
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: validationExceptionFactory,
    }),
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRoleType.User])
  @Patch(':id')
  async update(
    @Param('id', IdValidationPipe) id: string,
    @Body() dto: UpdateScheduleDto,
    @User() user: UsersPayloadDto,
  ) {
    const updatedSchedule = await this.scheduleService.update(id, dto, user.id);
    if (!updatedSchedule) {
      throw new HttpException(SCHEDULE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return updatedSchedule;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRoleType.User])
  @Delete(':id')
  async delete(
    @Param('id', IdValidationPipe) id: string,
    @User() user: UsersPayloadDto,
  ) {
    const deletedSchedule = await this.scheduleService.delete(id, user.id);
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
