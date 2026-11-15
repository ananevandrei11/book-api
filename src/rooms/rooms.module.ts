import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomsModel, RoomsSchema } from './model/rooms.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RoomsModel.name, schema: RoomsSchema, collection: 'rooms' },
    ]),
  ],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}
