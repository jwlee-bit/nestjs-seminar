import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, UserModel } from './entity/user.entity';
import {
  Between,
  Equal,
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { ProfileModel } from './entity/prefile.entity';
import { PostModel } from './entity/post.entity';
import { TagModel } from './entity/tag.entity';

@Controller()
export class AppController {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    @InjectRepository(ProfileModel)
    private readonly profileRepository: Repository<ProfileModel>,
    @InjectRepository(PostModel)
    private readonly postRepository: Repository<PostModel>,
    @InjectRepository(TagModel)
    private readonly tagRepository: Repository<TagModel>,
  ) {}

  @Post('sample')
  async sample() {
    // 모델에 해당되는 객체 생성 - 저장은 안함
    // const user1 = await this.userRepository.create({
    //   email: 'test@test.com',
    // });

    // const user2 = await this.userRepository.save({
    //   email: 'test@test.com',
    // });

    // preload
    // 입력 값을 기반으로 데이터베이스에 값을 불러오고 추가 입력된 값으로 값을 대체함
    // 저장은 안함
    // const user3 = await this.userRepository.preload({
    //   id: 101,
    //   email: 'test',
    // });

    // 값 증가
    await this.userRepository.increment(
      {
        id: 1,
      },
      'count',
      2,
    );

    // 값 감소
    await this.userRepository.decrement(
      {
        id: 1,
      },
      'count',
      1,
    );

    // 갯수 카운팅
    const count = await this.userRepository.count({
      where: {
        id: MoreThan(50),
      },
    });

    // sum
    const sum = await this.userRepository.sum('count', {
      id: MoreThan(50),
    });

    // 평균
    const avg = await this.userRepository.average('count', {
      id: MoreThan(50),
    });

    // 최소값
    const min = await this.userRepository.min('count', {
      id: MoreThan(50),
    });

    // 최대값
    const max = await this.userRepository.max('count', {
      id: MoreThan(50),
    });

    const usersAndCount = await this.userRepository.findAndCount({
      take: 3,
    });

    // 삭제하기
    await this.userRepository.delete(101);

    return true;
  }

  @Post('user')
  async postUser() {
    for (let i = 0; i < 100; i++) {
      await this.userRepository.save({
        email: `user-${i}@test.com`,
      });
    }
  }

  @Get('users')
  getUsers() {
    return this.userRepository.find({
      // 어떤 프로퍼티를 선택할지
      // 기본은 전부 가져옴
      // 정의를 안하면 전부 가져옴
      // 릴레이션이 추가되면 각 옵션에서 릴레이션의 프로퍼티를 선택할 수 있다.
      // select: {
      //   profile: {
      //     id: true,
      //   },
      // },
      // 필터링할 조건을 입력하게 된다.
      // 기본적으로 and조건 {}
      // or 조건을 사용하려면 where에 배열로 조건을 입력하면 된다.
      where: {
        // 아닌경우 가져오기
        // id: Not(1),
        // 적은경우
        // id: LessThan(30),
        // 작거나 같은 경우
        // id: LessThanOrEqual(30),
        // 큰경우
        // id: MoreThan(30),
        // id: MoreThanOrEqual(30),
        // id: Equal(30), // id가 30인 경우
        // 유사값
        // email: Like('%test.%'), // email이 test.으로 끝나는 경우
        // 대소문자 구분안함
        // email: ILike('%TEST.%'), // email이 TEST.으로 끝나는 경우 대소문자 구분안함
        // 사이값
        // id: Between(30, 50), // id가 30과 50 사이인 경우
        // 해당되는 여러개의 값
        // id: In([1, 2, 3, 4, 5]), // id가 1, 2, 3, 4, 5인 경우
        id: IsNull(),
      },
      // relations: {
      //   profile: true,
      // },
      // // ASC -> 오름차순
      // // DESC -> 내림차순
      // order: {
      //   id: 'DESC',
      // },
      // skip: 0, // 몇 개의 데이터를 건너뛸지
      // take: 5, // 몇 개의 데이터를 가져올지 0이면 전부 가져온다.
    });
  }
  // @Get()
  // getUsers() {
  //   return this.userRepository.find({
  //     // relations: {
  //     //   profile: true,
  //     //   posts: true,
  //     // },
  //   });
  // }

  @Patch('user/:id')
  async patchUser(@Param('id') id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new NotFoundException('User not found');

    return this.userRepository.save({
      ...user,
      email: user.email + '0',
    });
  }

  @Delete('user/profile/:id')
  async deleteUserProfile(@Param('id') id: number) {
    await this.profileRepository.delete(+id);
  }

  @Post('user/profile')
  async createUserAndProfile() {
    const user = await this.userRepository.save({
      email: 'profile@test.com',
      profile: {
        prefileImg: 'profile.jpg',
      },
    });

    // await this.profileRepository.save({
    //   profileImg: 'profile.jpg',
    //   user,
    // });

    return user;
  }

  @Post('user/post')
  async createUserAndPost() {
    const user = await this.userRepository.save({
      email: 'post@test.com',
    });

    await this.postRepository.save({
      title: 'post 1',
      authore: user,
    });

    await this.postRepository.save({
      title: 'post 2',
      authore: user,
    });

    return user;
  }

  @Post('post/tags')
  async createPostAndTag() {
    const post = await this.postRepository.save({
      title: 'post with tags',
    });

    const post2 = await this.postRepository.save({
      title: 'post2 with tags',
    });

    const tag1 = await this.tagRepository.save({
      name: 'tag1',
      posts: [post, post2],
    });

    const tag2 = await this.tagRepository.save({
      name: 'tag2',
      posts: [post],
    });

    const post3 = await this.postRepository.save({
      title: 'post2 with tags',
      tags: [tag1, tag2],
    });

    return true;
  }

  @Get('post')
  async getPosts() {
    return this.postRepository.find({
      relations: {
        tags: true,
      },
    });
  }

  @Get('tags')
  async getTags() {
    return this.tagRepository.find({
      relations: {
        posts: true,
      },
    });
  }
}
