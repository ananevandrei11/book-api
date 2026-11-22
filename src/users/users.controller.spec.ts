import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { getModelToken } from '@nestjs/mongoose';
import { UsersModel } from './model/users.model';
import { PasswordHasher } from '@nestjs/authentication';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const userRepositoryFactory = () => {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        PasswordHasher,
        {
          useFactory: userRepositoryFactory,
          provide: getModelToken(UsersModel.name),
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
