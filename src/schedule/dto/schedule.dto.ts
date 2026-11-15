export class CreateScheduleDto {
  roomId: string;
  date: string;
}

export class UpdateScheduleDto {
  roomId?: string;
  date?: string;
}
