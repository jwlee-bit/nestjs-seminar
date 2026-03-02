import { Injectable, NotFoundException } from '@nestjs/common';

export interface PostModel {
  id: number;
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

let posts : PostModel[] = [
  {
    id: 1,
    author: "newjeans_official",
    title: '뉴진스 민지',
    content: '뉴진스 민지입니다.',
    likeCount: 1000000,
    commentCount: 9999,
  },
  {
    id: 2,
    author: "newjeans_official",
    title: '뉴진스 헤린',
    content: '노래 연습하고있는헤린',
    likeCount: 1000000,
    commentCount: 9999,
  },{
    id: 3,
    author: "blackpink_official",
    title: '블랙핑크 로제',
    content: '블랙핑크 로제입니다.',
    likeCount: 1000000,
    commentCount: 9999,
  },
]

@Injectable()
export class PostsService {
  getAllPosts() {
    return posts;
  }

  getPostById(id: number) {
    const post = posts.find(post => post.id === +id);
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return post;
  }

  createPost(author: string, title: string, content: string) {
    const post: PostModel = {
      id : posts[posts.length - 1].id + 1,
      author,
      title,
      content,
      likeCount: 0,
      commentCount: 0,
    }

    posts = [
      ...posts,
      post
    ]
    
    return post;
  }

  updatePost(
    postId: number, 
    author?: string, 
    title?: string, 
    content?: string
  ) {
    const post = posts.find(post => post.id === postId);
    
    if (!post) {
      throw new NotFoundException(`Post with id ${postId} not found`);
    }

    if (author) {
      post.author = author;
    }

    if (title) {
      post.title = title;
    }

    if (content) {
      post.content = content;
    }

    posts = posts.map(prevPost => prevPost.id === postId ? post : prevPost);

    return post;
  }

  deletePost(postId: number) {
    const post = posts.find(post => post.id === postId);

    if (!post) {
      throw new NotFoundException(`Post with id ${postId} not found`);
    }

    posts = posts.filter(post => post.id !== postId);

    return postId;
  }
}
