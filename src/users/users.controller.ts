import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersDeleteDto } from './dto/users.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Delete(':id')
  @UsePipes(new ValidationPipe())
  async delete(@Param('id') id: string, @Body() dto: UsersDeleteDto) {
    const user = await this.usersService.validateUser(dto.email, dto.password);
    return await this.usersService.deleteUser(id, user.email);
  }
}
