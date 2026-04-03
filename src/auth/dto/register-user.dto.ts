import { PickType } from '@nestjs/mapped-types';
import { UsersModel } from 'src/users/entities/users.entity';

export class ResgisterUserDto extends PickType(UsersModel, [
  'nickname',
  'password',
  'email',
]) {}
