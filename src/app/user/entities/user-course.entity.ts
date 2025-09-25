import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Course } from '../../course/entities/course.entity';
import { UserQuest } from '../../user-quest/entities/user-quest.entity'

@Entity('user_courses')
export class UserCourse {
  @PrimaryGeneratedColumn({ name: 'user_course_id' })
  userCourseId: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ name: 'course_id', type: 'bigint' })
  courseId: number;

  @Column({ name: 'done_yn', type: 'boolean', default: false, comment: '완료 여부' })
  doneYn: boolean;

  @Column({ name: 'started_at', type: 'datetime', nullable: true, comment: '시작일시' })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'datetime', nullable: true, comment: '완료일시' })
  completedAt: Date;

  @Column({ name: 'progress_rate', type: 'smallint', default: 0, comment: '진행률' })
  progressRate: number;

  @ManyToOne(() => User, user => user.userCourses)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Course, course => course.userCourses)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @OneToMany(() => UserQuest, userQuest => userQuest.userCourse)
  userQuests: UserQuest[];
}
