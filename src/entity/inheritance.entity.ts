import {
  ChildEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  TableInheritance,
  UpdateDateColumn,
} from 'typeorm';

// 테이블 생성 X
export class BaseModel {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}

@Entity()
export class BookModel extends BaseModel {
  @Column()
  name: string;
}

@Entity()
export class CarModel extends BaseModel {
  @Column()
  brand: string;
}

@Entity()
@TableInheritance({
  column: {
    // 테이블 하나로 2개의 엔티티 관리
    // 하나의 테이블에서 그 안에 들어가는 로우가 Computer인지 AirplaneModel인지 구분하기 위한 컬럼
    name: 'type',
    type: 'varchar',
  },
})
export class SingleBaseModel {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}

@ChildEntity()
export class Computer extends SingleBaseModel {
  @Column()
  brand: string;
}

@ChildEntity()
export class AirplaneModel extends SingleBaseModel {
  @Column()
  country: string;
}
