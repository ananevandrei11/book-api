import { IsEmail, IsEnum, IsString } from 'class-validator';
import { UserRoleType } from '../model/users.model';
import { PickType } from '@nestjs/mapped-types';

export class UserRegisterDto {
  @IsEmail()
  email: string;
  @IsString()
  password: string;
  @IsString()
  firstName: string;
  @IsString()
  lastName: string;
  @IsString()
  phone: string;
  @IsEnum(UserRoleType)
  role: UserRoleType;
}
export class UsersPayloadDto extends PickType(UserRegisterDto, [
  'email',
  'firstName',
  'lastName',
  'phone',
  'role',
] as const) {}

export class UsersDeleteDto extends PickType(UserRegisterDto, [
  'email',
  'password',
] as const) {}
