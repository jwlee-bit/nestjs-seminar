import { BadRequestException, Injectable } from '@nestjs/common';
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
    user: Pick<UsersModel, 'email' | 'nickname' | 'password'>,
  ): Promise<UsersModel> {
    const { nickname, email, password } = user;

    // 중복여부 확인  exists() -> 값이 있으면 true
    const nicknameExists = await this.usersRepository.exists({
      where: {
        nickname: user.nickname,
      },
    });

    if (nicknameExists) {
      throw new BadRequestException('닉넴 존재');
    }

    const emailExists = await this.usersRepository.exists({
      where: {
        email: user.email,
      },
    });

    if (emailExists) {
      throw new BadRequestException('이멜 존재');
    }

    const userObject = this.usersRepository.create({
      nickname,
      email,
      password,
    });
    return this.usersRepository.save(userObject);
  }

  async getAllUsers(): Promise<UsersModel[]> {
    return this.usersRepository.find();
  }

  async getUserByEmail(email: string) {
    return this.usersRepository.findOne({
      where: {
        email,
      },
    });
  }
}
