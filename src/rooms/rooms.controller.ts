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
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto, UpdateRoomDto } from './dto/room.dto';
import { ROOM_NOT_FOUND } from './constants/rooms.errors.constants';
import { IdValidationPipe } from '../pipes/id-validation.pipe';
import { validationExceptionFactory } from '../pipes/validation-exception.factory';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRoleType } from '../users/model/users.model';
import { Roles } from '../decorators/roles.decorator';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRoleType.Admin])
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
      exceptionFactory: validationExceptionFactory,
    }),
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRoleType.Admin])
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRoleType.Admin])
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
