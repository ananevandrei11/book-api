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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  async register(@Body() dto: UserRegisterDto) {
    return await this.authService.register(dto);
  }

  @HttpCode(200)
  @Post('/login')
  @UsePipes(new ValidationPipe())
  async login(@Body() dto: AuthLoginDto) {
    return await this.authService.login(dto);
  }
}
