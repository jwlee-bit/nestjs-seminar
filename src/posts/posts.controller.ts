import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PagintePostDto } from './dto/paginte-post.dto';
import { ImagesModelType } from 'src/common/entity/images.entity';
import { DataSource } from 'typeorm';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  getPosts(@Query() query: PagintePostDto) {
    // return this.postsService.getAllPosts();
    return this.postsService.cursorPaginatePosts(query);
  }

  @Get(':id')
  getPost(@Param('id') id: string) {
    return this.postsService.getPostById(+id);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  async postPosts(@User('id') userId: number, @Body() body: CreatePostDto) {
    const qr = this.dataSource.createQueryRunner();

    // 쿼리러너에 연결
    await qr.connect();
    // 쿼리 러너에서 트랜잭션 실행
    // 이 시점부터 같은 쿼리 러너 사용시 트랜잭션 안에서 액션
    await qr.startTransaction();

    try {
      const post = await this.postsService.createPost(userId, body, qr);

      for (let i = 0; i < body.images.length; i++) {
        await this.postsService.createPostImage({
          post,
          order: i,
          path: body.images[i],
          type: ImagesModelType.POST_IMAGE,
        });
      }

      await qr.commitTransaction();
      await qr.release();

      return this.postsService.getPostById(post.id);
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
    }
  }

  @Patch(':id')
  patchPosts(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePostDto,
  ) {
    return this.postsService.updatePost(id, body);
  }

  @Delete(':id')
  deletePost(@Param('id') id: string) {
    return this.postsService.deletePost(+id);
  }
}
