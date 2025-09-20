import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Quest } from '../../quest/entities/quest.entity';
import { UserCourse } from '../../user/entities/user-course.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn({ name: 'course_id' })
  courseId: number;

  @Column({ name: 'title', type: 'varchar', length: 100, comment: '과정 타이틀' })
  title: string;

  @Column({ name: 'type', type: 'varchar', length: 20, comment: '단어, 문장, 비교, 소리' })
  type: string;

  @Column({ name: 'quest_count', type: 'smallint', default: 0, comment: 'Quest 갯수' })
  questCount: number;

  @Column({ name: 'order', type: 'smallint', default: 0, comment: '순서' })
  order: number;

  @Column({ name: 'objective', type: 'text', nullable: true, comment: '학습 목적' })
  objective: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'varchar', length: 50, nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'varchar', length: 50, nullable: true })
  updatedBy: string;

  @OneToMany(() => Quest, quest => quest.course)
  quests: Quest[];

  @OneToMany(() => UserCourse, userCourse => userCourse.course)
  userCourses: UserCourse[];
}
