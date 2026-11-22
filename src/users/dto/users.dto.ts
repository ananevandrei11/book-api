import { IsEmail, IsString } from 'class-validator';
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
}
export class UsersPayloadDto extends PickType(UserRegisterDto, [
  'email',
  'firstName',
  'lastName',
  'phone',
] as const) {
  id: string;
  role: UserRoleType;
}

export class UsersDeleteDto extends PickType(UserRegisterDto, [
  'email',
  'password',
] as const) {}
