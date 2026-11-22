import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UsersPayloadDto } from '../users/dto/users.dto';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UsersPayloadDto => {
    return ctx.switchToHttp().getRequest().user;
  },
);
