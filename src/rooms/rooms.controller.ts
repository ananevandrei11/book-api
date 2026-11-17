import {
  BadRequestException,
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
import { RoomsService } from './rooms.service';
import { CreateRoomDto, UpdateRoomDto } from './dto/room.dto';
import { ROOM_NOT_FOUND } from './constants/rooms.errors.constants';
import { IdValidationPipe } from '../pipes/id-validation.pipe';
import { ValidationError } from 'class-validator';
import { validationExceptionFactory } from '../pipes/validation-exception.factory';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @UsePipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: validationExceptionFactory,
    }),
  )
  @Post('/create')
  create(@Body() dto: CreateRoomDto) {
    return this.roomsService.create(dto);
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
    @Body() dto: UpdateRoomDto,
  ) {
    const updatedRoom = await this.roomsService.update(id, dto);
    if (!updatedRoom) {
      throw new HttpException(ROOM_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return updatedRoom;
  }

  @Delete(':id')
  async delete(@Param('id', IdValidationPipe) id: string) {
    const deletedRoom = await this.roomsService.delete(id);
    if (!deletedRoom) {
      throw new HttpException(ROOM_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
  }

  @Get(':id')
  async findRoomById(@Param('id', IdValidationPipe) id: string) {
    const room = await this.roomsService.findRoomById(id);
    if (!room) {
      throw new HttpException(ROOM_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return room;
  }

  @Get()
  findAll() {
    return this.roomsService.findAll();
  }
}
