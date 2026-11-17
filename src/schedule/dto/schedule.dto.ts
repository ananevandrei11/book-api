import { IsMongoId, IsString, IsUUID, Matches } from "class-validator";
import { SCHEDULE_DTO_VALIDATION } from "../constants/schedule.errors.constants";

export class CreateScheduleDto {
  @IsMongoId()
  roomId: string;
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: SCHEDULE_DTO_VALIDATION.date })
  date: string;
}

export class UpdateScheduleDto {
  @IsMongoId()
  roomId?: string;
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: SCHEDULE_DTO_VALIDATION.date })
  date?: string;
}
