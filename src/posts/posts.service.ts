import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, LessThan, MoreThan, Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PagintePostDto } from './dto/paginte-post.dto';
import { HOST, PORT, PROTOCOL } from 'src/common/const/env.const';
import { last } from 'rxjs';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    private readonly commonService: CommonService,
  ) {}

  async getAllPosts() {
    return this.postsRepository.find({
      relations: ['author'],
    });
  }

  async paginatePosts(dto: PagintePostDto) {
    return this.commonService.paginate(
      dto,
      this.postsRepository,
      {
        relations: ['author'],
      },
      '/posts',
    );
    // if (dto.page) {
    //   // Page-based pagination logic would go here
    //   return this.pagePaginatePosts(dto);
    // } else {
    //   return this.cursorPaginatePosts(dto);
    // }
  }

  async pagePaginatePosts(dto: PagintePostDto) {
    const [posts, totalCount] = await this.postsRepository.findAndCount({
      order: {
        createdAt: dto.order__createdAt,
      },
      skip: ((dto.page ?? 1) - 1) * dto.take,
      take: dto.take,
    });

    const totalPages = Math.ceil(totalCount / dto.take);

    return {
      data: posts,
      meta: {
        totalCount,
        totalPages,
        currentPage: dto.page ?? 1,
      },
    };
  }

  async cursorPaginatePosts(dto: PagintePostDto) {
    const where: FindOptionsWhere<PostsModel> = {};

    if (dto.where__id__less_than) {
      where.id = LessThan(dto.where__id__less_than);
    } else if (dto.where__id__more_than) {
      where.id = MoreThan(dto.where__id__more_than);
    }

    const posts = await this.postsRepository.find({
      where,
      order: {
        createdAt: dto.order__createdAt,
      },
      take: dto.take,
    });

    // 해당되면 포스트가 0개 이상이면
    // 마지막 포스트르 ㄹ가져오고
    // 아니며 null
    const lastItem =
      posts.length > 0 && posts.length === dto.take
        ? posts[posts.length - 1]
        : null;

    const nextUrl = lastItem && new URL(`${PROTOCOL}://${HOST}:${PORT}/posts`);

    if (nextUrl) {
      for (const key of Object.keys(dto)) {
        const value =
          key === 'where__id__more_than' && 'where__id__less_than'
            ? lastItem.id.toString()
            : dto[key as keyof PagintePostDto];
        if (value) {
          nextUrl.searchParams.append(key, String(value));
        }
      }

      let key = null;

      if (dto.order__createdAt === 'asc') {
        key = 'where__id__more_than';
      } else {
        key = 'where__id__less_than';
      }

      nextUrl.searchParams.append(
        'where__id_more_than',
        lastItem.id.toString(),
      );
    }

    /**
     * Response
     * data: Data[]
     * cursor: {
     *  after: 마지막 data id
     * }
     * count: 응답한 데이터 갯수
     * next: 다음 오쳥을 할때 사용할 URL
     */

    return {
      data: posts,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: posts.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return post;
  }

  async createPost(authorId: number, body: CreatePostDto) {
    // 1) create -> 저장할 객체 생성
    // 2) save -> 객체 저장 (create에서 생성한 객체로)
    const post = this.postsRepository.create({
      author: {
        id: authorId,
      },
      ...body,
      likeCount: 0,
      commentCount: 0,
    });
    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async updatePost(postId: number, body: UpdatePostDto) {
    /**
     * save 기능
     * 1) id가 존재하는 경우 -> 해당 id의 데이터 업데이트
     * 2) id가 존재하지 않는 경우 -> 새로운 데이터 생성
     */
    const post = await this.postsRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with id ${postId} not found`);
    }

    const { title, content } = body;

    if (title) {
      post.title = title;
    }

    if (content) {
      post.content = content;
    }

    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async deletePost(postId: number) {
    const post = await this.postsRepository.findOneBy({ id: postId });

    if (!post) {
      throw new NotFoundException(`Post with id ${postId} not found`);
    }

    return this.postsRepository.delete({ id: postId });
  }
}
