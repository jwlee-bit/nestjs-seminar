import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { ProfileModel } from './prefile.entity';
import { PostModel } from './post.entity';

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity()
export class UserModel {
  // 테이블 안에서 각각의 Row를 구분 할 수 있는 컬럼이다.
  // @PrimaryColumn()

  // PrimaryGeneratedColumn -> 순서대로 위로 올라간다
  // 1, 2, 3, 4, 5, 6, 7, 8, 9, 10

  // @PrimaryGeneratedColumn('uuid')
  // UUID -> 36자리의 문자열로 랜덤하게 생성된다.
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  // @Column({
  //   // 데이터베이스에서 인지하는 컬럼 타입
  //   // 자동 유추
  //   type: 'varchar',
  //   // 데이터 베이스 칼럼 이름
  //   // 자동 유추
  //   name: 'title',
  //   // 길이
  //   // 입력 할 수 있는 글자의 길이
  //   length: 100, // -> 지원안되는 타입있음
  //   // nullable -> null 허용 여부
  //   nullable: false,
  //   // true면 처음 저장할때만 값 지정 가능
  //   // 이후에는 값 변경 불가능
  //   update: true,
  //   select: true, // false면 조회할 때 해당 컬럼이 조회되지 않는다.
  //   default: 'default title', // 컬럼의 기본값
  //   // 컬럼중 유일무이한 값이 되어야함
  //   // 유니크 제약 조건 기본값 false
  //   unique: true,
  // })
  // title: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  // @CreateDateColumn()
  // -> 엔티티가 생성될 때 자동으로 현재 날짜와 시간으로 설정된다.
  @CreateDateColumn()
  createdAt: Date;

  // @UpdateDateColumn()
  // -> 엔티티가 업데이트될 때마다 자동으로 현재 날짜와 시간으로 설정된다.
  @UpdateDateColumn()
  updatedAt: Date;

  // 데이터가 업데이트 될때마다 1씩 올라간다.
  // 처음생성시 값은 1
  // save() 함수가 몇번 불렀는지 기억한다.
  @VersionColumn()
  version: number;

  // @Column과 같이 사용
  // Generated('increment') -> 순서대로 1씩 올라간다.
  // uuid -> 매번 데이터 생성시 uuid생성
  @Column()
  @Generated('uuid')
  additionalId: string;

  @OneToOne(() => ProfileModel, (profile) => profile.user, {
    // find() 마다 가져올 relation
    eager: true, // eager 옵션을 사용하면 UserModel을 조회할 때 ProfileModel도 자동으로 함께 조회된다. 즉, UserModel과 ProfileModel이 항상 함께 로드된다.

    // 저장할때 relation을 한번에 같이 저장가능
    // false시 동시저장을 막음
    cascade: true, // cascade 옵션을 사용하면 UserModel을 저장할 때 ProfileModel도 자동으로 함께 저장된다. 즉, UserModel과 ProfileModel이 함께 저장되고 업데이트된다.
    nullable: true, // 기본값 true
    deferrable: 'INITIALLY DEFERRED', // deferrable 옵션은 데이터베이스에서 외래 키 제약 조건의 평가 시점을 제어하는 데 사용됩니다. 'INITIALLY DEFERRED'로 설정하면 트랜잭션이 커밋될 때까지 외래 키 제약 조건의 평가가 지연됩니다. 즉, UserModel과 ProfileModel 간의 관계가 트랜잭션이 완료될 때까지 유효하지 않을 수 있습니다.
    // no-action 아무것도 안함
    // cascade -> 참조하는 row도 같이 삭제
    // set null -> 참조하는 row의 id를 null로 변경
    // set default -> 참조하는 row의 id를 default값으로 변경
    // restrict -> 참조하는 row가 있으면 삭제 불가능
    onDelete: 'CASCADE', // onDelete 옵션을 사용하면 UserModel이 삭제될 때 ProfileModel도 자동으로 함께 삭제된다. 즉, UserModel과 ProfileModel이 함께 삭제된다.
  })
  profile: ProfileModel;

  @OneToMany(() => PostModel, (post) => post.author)
  posts: PostModel[];

  @Column({
    default: 0,
  })
  count: number;
}
