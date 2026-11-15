import { HotelRoomType } from '../model/rooms.model';

export class CreateRoomDto {
  type: HotelRoomType;
  number: number;
  seaView: boolean;
}

export class UpdateRoomDto {
  type?: HotelRoomType;
  number?: number;
  seaView?: boolean;
}
