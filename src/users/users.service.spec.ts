import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { UsersModel } from './model/users.model';
import { PasswordHasher } from '@nestjs/authentication';

describe('UsersService', () => {
  let service: UsersService;

  const userRepositoryFactory = () => {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        PasswordHasher,
        {
          useFactory: userRepositoryFactory,
          provide: getModelToken(UsersModel.name),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
