import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Course } from '../../course/entities/course.entity';
import { QuestItem } from './quest-item.entity';

@Entity('quests')
export class Quest {
  @PrimaryGeneratedColumn({ name: 'quest_id' })
  questId: number;

  @Column({ name: 'course_id', type: 'bigint' })
  courseId: number;

  @Column({ name: 'quest_item_count', type: 'smallint', default: 0, comment: 'Quest Item 갯수' })
  questItemCount: number;

  @Column({ name: 'order', type: 'smallint', default: 0, comment: '순서' })
  order: number;

  @ManyToOne(() => Course, course => course.quests)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @OneToMany(() => QuestItem, questItem => questItem.quest)
  questItems: QuestItem[];
}
