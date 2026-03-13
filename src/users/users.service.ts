import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersModel } from './entities/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
  ) {}

  async createUser(
    nickname: string,
    email: string,
    password: string,
  ): Promise<UsersModel> {
    const user = this.usersRepository.create({ nickname, email, password });
    return this.usersRepository.save(user);
  }

  async getAllUsers(): Promise<UsersModel[]> {
    return this.usersRepository.find();
  }
}
