import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { ScheduleModel } from './model/schedule.model';
import { getModelToken } from '@nestjs/mongoose';
import { RoomsModel } from '../rooms/model/rooms.model';
import { RoomsService } from '../rooms/rooms.service';

describe('ScheduleController', () => {
  let controller: ScheduleController;
  const scheduleRepositoryFactory = () => {};
  const roomsServiceFactory = () => {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleController],
      providers: [
        ScheduleService,
        {
          useFactory: scheduleRepositoryFactory,
          provide: getModelToken(ScheduleModel.name),
        },
        {
          provide: RoomsService,
          useFactory: roomsServiceFactory,
        }
      ],
    }).compile();

    controller = module.get<ScheduleController>(ScheduleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
