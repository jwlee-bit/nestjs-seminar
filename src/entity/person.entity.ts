import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// entity embedding
// 엔티티 선언 X
export class Name {
  @Column()
  first: string;

  @Column()
  last: string;
}

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  // 실 생성시
  // name_first, name_last 컬럼이 생성됨
  @Column(() => Name)
  name: Name;

  @Column()
  class: string;
}

@Entity()
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column(() => Name)
  name: Name;

  @Column()
  salary: number;
}
