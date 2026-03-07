import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

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

  @Column({
    // 데이터베이스에서 인지하는 컬럼 타입
    // 자동 유추
    type: 'varchar',
    // 데이터 베이스 칼럼 이름
    // 자동 유추
    name: 'title',
    // 길이
    // 입력 할 수 있는 글자의 길이
    length: 100, // -> 지원안되는 타입있음
    // nullable -> null 허용 여부
    nullable: false,
    // true면 처음 저장할때만 값 지정 가능
    // 이후에는 값 변경 불가능
    update: true,
    select: true, // false면 조회할 때 해당 컬럼이 조회되지 않는다.
    default: 'default title', // 컬럼의 기본값
    // 컬럼중 유일무이한 값이 되어야함
    // 유니크 제약 조건 기본값 false
    unique: true,
  })
  title: string;

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
}
