import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { getModelToken } from '@nestjs/mongoose';
import { UsersModel } from '../users/model/users.model';
import { PasswordHasher } from '@nestjs/authentication';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let controller: AuthController;

  const userRepositoryFactory = () => {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtService,
        UsersService,
        PasswordHasher,
        {
          useFactory: userRepositoryFactory,
          provide: getModelToken(UsersModel.name),
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
