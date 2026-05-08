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
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PagintePostDto } from './dto/paginte-post.dto';
import { ImagesModelType } from 'src/common/entity/images.entity';
import { DataSource, type QueryRunner } from 'typeorm';
import { TrInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner as QueryRunnerDecorator } from 'src/common/decorator/query-runner.decorator';

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
  @UseInterceptors(TrInterceptor)
  async postPosts(
    @User('id') userId: number,
    @Body() body: CreatePostDto,
    @QueryRunnerDecorator() qr: QueryRunner,
  ) {
    const post = await this.postsService.createPost(userId, body, qr);

    for (let i = 0; i < body.images.length; i++) {
      await this.postsService.createPostImage({
        post,
        order: i,
        path: body.images[i],
        type: ImagesModelType.POST_IMAGE,
      });
    }

    return this.postsService.getPostById(post.id);
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
