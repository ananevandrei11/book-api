import { Reflector } from '@nestjs/core';
import { UserRoleType } from '../users/model/users.model';

export const Roles = Reflector.createDecorator<UserRoleType[]>();
