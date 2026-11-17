import { IsBoolean, IsEnum, IsNumber, Min } from 'class-validator';
import { HotelRoomType } from '../model/rooms.model';
import { ROOM_DTO_VALIDATION } from '../constants/rooms.errors.constants';

export class CreateRoomDto {
  @IsEnum(HotelRoomType, { message: ROOM_DTO_VALIDATION.type })
  type: HotelRoomType;

  @IsNumber()
  @Min(1, { message: ROOM_DTO_VALIDATION.minNumber })
  number: number;

  @IsBoolean()
  seaView: boolean;
}

export class UpdateRoomDto {
  @IsEnum(HotelRoomType, { message: ROOM_DTO_VALIDATION.type })
  type?: HotelRoomType;

  @IsNumber()
  @Min(1, { message: ROOM_DTO_VALIDATION.minNumber })
  number?: number;

  @IsBoolean()
  seaView?: boolean;
}
