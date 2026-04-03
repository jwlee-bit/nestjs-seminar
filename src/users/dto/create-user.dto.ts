import { PickType } from '@nestjs/mapped-types';
import { UsersModel } from '../entities/users.entity';

export class CreateUserDto extends PickType(UsersModel, [
  'nickname',
  'email',
  'password',
]) {}
