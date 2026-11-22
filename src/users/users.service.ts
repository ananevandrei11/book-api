import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UsersDocument, UsersModel } from './model/users.model';
import { Model } from 'mongoose';
import { UserRegisterDto, UsersPayloadDto } from './dto/users.dto';
import { PasswordHasher } from '@nestjs/authentication';
import {
  USER_NOT_FOUND,
  USER_WRONG_PASSWORD,
} from './constants/users.errors.constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UsersModel.name)
    private userModel: Model<UsersModel>,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async createUser(dto: UserRegisterDto): Promise<UsersDocument | null> {
    const newUser = await this.userModel.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      role: dto.role,
      passwordHash: await this.passwordHasher.hash(dto.password),
    });
    return newUser;
  }

  async findUserByEmail(email: string): Promise<UsersDocument | null> {
    return await this.userModel.findOne({ email }).exec();
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UsersPayloadDto> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException(USER_NOT_FOUND);
    }
    const isCorrectPassword = await this.passwordHasher.verify(
      password,
      user.passwordHash,
    );
    if (!isCorrectPassword) {
      throw new UnauthorizedException(USER_WRONG_PASSWORD);
    }
    return {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
    };
  }

  async deleteUser(id: string, email: string): Promise<UsersDocument | null> {
    const deletedUser = await this.userModel.findOneAndDelete(
      {
        _id: id,
        email, 
      },
      {
        returnDocument: 'after',
      },
    ).exec();
    return deletedUser;
  }
}
