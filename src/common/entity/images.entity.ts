import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseModel } from './base.entity';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PostsModel } from 'src/posts/entities/posts.entity';

export enum ImagesModelType {
  USER_PROFILE = 'USER_PROFILE',
  POST_IMAGE = 'POST_IMAGE',
}

@Entity()
export class ImagesModel extends BaseModel {
  @Column({ default: 0 })
  @IsInt()
  @IsOptional()
  order: number;

  // usermodel => 사용자 프로필 이미지
  // postmodel => 게시글 이미지
  @Column({
    enum: ImagesModelType,
  })
  @IsEnum(ImagesModelType)
  @IsString()
  type: ImagesModelType;

  @Column()
  @IsString()
  @Transform(({ value, obj }) => {
    if (obj.type === ImagesModelType.USER_PROFILE) {
      return value
        ? `${process.env.PROTOCOL}://${process.env.HOST}:${process.env.PORT}/${value}`
        : null;
    } else {
      return value;
    }
  })
  path: string;

  @ManyToOne(() => PostsModel, (post) => post.images)
  post?: PostsModel;
}
