import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersModel } from './entities/users.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  postUser(
    @Body('nickname') nickname: string,
    @Body('email') email: string,
    @Body('passowrd') password: string,
  ): Promise<UsersModel> {
    return this.usersService.createUser(nickname, email, password);
  }
}
