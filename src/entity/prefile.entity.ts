import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserModel } from './user.entity';

@Entity()
export class ProfileModel {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => UserModel, (user) => user.profile)
  @JoinColumn() // JoinColumn 데코레이터는 양방향 관계에서 어느 쪽이 외래 키를 가질지를 결정하는 데 사용됩니다. 이 경우, ProfileModel이 UserModel과의 관계에서 외래 키를 가지게 됩니다
  user: UserModel;

  @Column()
  prefileImg: string;
}
