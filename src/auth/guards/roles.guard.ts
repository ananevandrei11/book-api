import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../../decorators/roles.decorator';
import { INSUFFICIENT_ROLE } from '../constants/auth.errors.constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride(Roles, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles) {
      throw new ForbiddenException(INSUFFICIENT_ROLE);
    }
    const { user } = context.switchToHttp().getRequest();
    if (!roles.includes(user?.role)) {
      throw new ForbiddenException(INSUFFICIENT_ROLE);
    }
    return true;
  }
}
