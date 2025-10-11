import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { QuestItem } from './quest-item.entity';

@Entity('quests')
export class Quest {
  @PrimaryGeneratedColumn({ name: 'quest_id' })
  questId: number;

  @Column({ name: 'quest_item_count', type: 'smallint', default: 0, comment: 'Quest Item 갯수' })
  questItemCount: number;

  @Column({ name: 'order', type: 'smallint', default: 0, comment: '순서' })
  order: number;

  @Column({ name: 'title', type: 'varchar', length: 100, comment: '문제집 타이틀' })
  title: string;

  @Column({ name: 'type', type: 'varchar', length: 100, comment: '문제집 타입' })
  type: string;

  @OneToMany(() => QuestItem, questItem => questItem.quest)
  questItems: QuestItem[];
}
