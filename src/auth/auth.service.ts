import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UsersDocument, UsersModel } from '../users/model/users.model';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { UserRegisterDto, UsersPayloadDto } from '../users/dto/users.dto';
import { UsersService } from '../users/users.service';
import { AuthLoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: UserRegisterDto) {
    const oldUser = await this.userService.findUserByEmail(dto.email);
    if (oldUser) {
      throw new BadRequestException('User is already registered');
    }
    return this.userService.createUser(dto);
  }

  async login(dto: AuthLoginDto) {
    const payload = await this.userService.validateUser(dto.email, dto.password);
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
