import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsEnum, IsInt, Min } from 'class-validator';
import { HotelRoomType } from '../model/rooms.model';
import { ROOM_DTO_VALIDATION } from '../constants/rooms.errors.constants';

export class CreateRoomDto {
  @IsEnum(HotelRoomType, { message: ROOM_DTO_VALIDATION.type })
  type: HotelRoomType;

  @IsInt({ message: ROOM_DTO_VALIDATION.intNumber })
  @Min(1, { message: ROOM_DTO_VALIDATION.minNumber })
  number: number;

  @IsBoolean({ message: ROOM_DTO_VALIDATION.seaView })
  seaView: boolean;
}

export class UpdateRoomDto extends PartialType(CreateRoomDto, {
  skipNullProperties: false,
}) {}
