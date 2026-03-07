import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, UserModel } from './entity/user.entity';
import { Repository } from 'typeorm';

@Controller()
export class AppController {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
  ) {}

  @Post('user')
  postUser() {
    return this.userRepository.save({
      title: 'test title',
      role: Role.ADMIN,
    });
  }

  @Get()
  getUsers() {
    return this.userRepository.find();
  }

  @Patch('user/:id')
  async patchUser(@Param('id') id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new NotFoundException('User not found');

    return this.userRepository.save({
      ...user,
      title: user.title + '0',
    });
  }
}
