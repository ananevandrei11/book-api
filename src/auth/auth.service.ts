import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRegisterDto } from '../users/dto/users.dto';
import { UsersService } from '../users/users.service';
import { AuthLoginDto } from './dto/auth.dto';
import { USER_ALREADY_REGISTERED } from './constants/auth.errors.constants';
import { UserRoleType } from '../users/model/users.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: UserRegisterDto, role?: UserRoleType) {
    const oldUser = await this.userService.findUserByEmail(dto.email);
    if (oldUser) {
      throw new BadRequestException(USER_ALREADY_REGISTERED);
    }
    const newUser = await this.userService.createUser(dto, role);
    return {
      _id: newUser._id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phone: newUser.phone,
      role: newUser.role,
    };
  }

  async login(dto: AuthLoginDto) {
    const payload = await this.userService.validateUser(
      dto.email,
      dto.password,
    );
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
