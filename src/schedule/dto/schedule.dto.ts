import { PartialType } from '@nestjs/mapped-types';
import { IsDateString, IsMongoId, Matches } from 'class-validator';
import { SCHEDULE_DTO_VALIDATION } from '../constants/schedule.errors.constants';

export class CreateScheduleDto {
  @IsMongoId()
  roomId: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: SCHEDULE_DTO_VALIDATION.date })
  @IsDateString({ strict: true }, { message: SCHEDULE_DTO_VALIDATION.realDate })
  date: string;
}

export class UpdateScheduleDto extends PartialType(CreateScheduleDto, {
  skipNullProperties: false,
}) {}
