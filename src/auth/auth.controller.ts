import {
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRegisterDto } from '../users/dto/users.dto';
import { AuthLoginDto } from './dto/auth.dto';
import { UserRoleType } from '../users/model/users.model';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  async register(@Body() dto: UserRegisterDto) {
    return await this.authService.register(dto);
  }

  @Post('/register-admin')
  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  async registerAdmin(@Body() dto: UserRegisterDto) {
    return await this.authService.register(dto, UserRoleType.Admin);
  }

  @HttpCode(200)
  @Post('/login')
  @UsePipes(new ValidationPipe())
  async login(@Body() dto: AuthLoginDto) {
    return await this.authService.login(dto);
  }
}
