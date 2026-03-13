import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserModel } from './user.entity';
import { TagModel } from './tag.entity';

@Entity()
export class PostModel {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserModel, (user) => user.id)
  author: UserModel;

  @ManyToMany(() => TagModel, (tag) => tag.posts)
  @JoinTable() // JoinTable 데코레이터는 양방향 관계에서 어느 쪽이 외래 키를 가질지를 결정하는 데 사용됩니다. 이 경우, PostModel이 TagModel과의 관계에서 외래 키를 가지게 됩니다
  tags: TagModel[];

  @Column()
  title: string;
}
