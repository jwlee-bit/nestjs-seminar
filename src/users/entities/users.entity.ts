import { Column, Entity, OneToMany } from 'typeorm';
import { Role } from '../const/roles.const';
import { PostsModel } from 'src/posts/entities/posts.entity';
import { BaseModel } from 'src/common/entity/base.entity';
import { IsEmail, IsString, Length } from 'class-validator';
import { validationMessage } from 'src/common/validation-message/validation.message';
import { Exclude, Expose } from 'class-transformer';

@Entity()
// @Exclude() // 클래스 전체에 Exclude를 적용하여, 명시적으로 @Expose()가 붙은 필드만 응답에 포함되도록 설정합니다.
export class UsersModel extends BaseModel {
  @Column({
    length: 20,
    type: 'varchar',
    unique: true,
  })
  @IsString({
    message: validationMessage.string,
  })
  @Length(2, 20, {
    message: validationMessage.length,
  })
  nickname: string;

  @Column({
    unique: true,
  })
  @IsString({
    message: validationMessage.string,
  })
  @IsEmail(
    {},
    {
      message: validationMessage.email,
    },
  )
  email: string;

  @Column()
  @IsString({
    message: validationMessage.string,
  })
  @Length(3, 8, {
    message: validationMessage.length,
  })
  /**
   * toClassOnly => class instance로 변환 즉 request로만 적용
   * toPlainOnly => plain object로 변환 즉 response로만 적용되어 제외됨
   */
  @Exclude({ toPlainOnly: true })
  password: string;

  @Expose() // showMe는 실제 데이터베이스 컬럼이 아니지만, 응답에 포함시키고 싶은 가상 필드입니다.
  get showMe() {
    return `EE${this.email}EE!!!!!!!!!!!!!!!!`;
  }

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];
}
