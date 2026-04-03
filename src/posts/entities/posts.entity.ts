import { IsString } from 'class-validator';
import { BaseModel } from 'src/common/entity/base.entity';
import { validationMessage } from 'src/common/validation-message/validation.message';
import { UsersModel } from 'src/users/entities/users.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PostsModel extends BaseModel {
  @ManyToOne(() => UsersModel, (user) => user.posts, {
    nullable: false,
  })
  author: UsersModel;

  @Column()
  @IsString({
    message: validationMessage.string,
  })
  title: string;

  @Column()
  @IsString({
    message: validationMessage.string,
  })
  content: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;
}
