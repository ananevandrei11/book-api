import { Test, TestingModule } from '@nestjs/testing';
import { RoomsController } from './rooms.controller';
import { getModelToken } from '@nestjs/mongoose';
import { RoomsModel } from './model/rooms.model';
import { RoomsService } from './rooms.service';

describe('RoomsController', () => {
  let controller: RoomsController;

  const roomRepositoryFactory = () => {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomsController],
      providers: [
        RoomsService,
        {
          useFactory: roomRepositoryFactory,
          provide: getModelToken(RoomsModel.name),
        },
      ],
    }).compile();

    controller = module.get<RoomsController>(RoomsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
