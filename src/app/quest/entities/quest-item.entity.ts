import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Quest } from './quest.entity';
import { QuestItemUnit } from './quest-item-unit.entity';

@Entity('quest_items')
export class QuestItem {
  @PrimaryGeneratedColumn({ name: 'quest_item_id' })
  questItemId: number;

  @Column({ name: 'quest_id', type: 'bigint' })
  questId: number;

  @Column({ name: 'type', type: 'varchar', length: 20, comment: '문제 타입' })
  type: string;

  @Column({ name: 'has_answer', type: 'boolean', default: false, comment: '답변 여부' })
  hasAnswer: boolean;

  @Column({ name: 'question1', type: 'bigint', nullable: true })
  question1: number;

  @Column({ name: 'question2', type: 'bigint', nullable: true })
  question2: number;

  @Column({ name: 'question3', type: 'bigint', nullable: true })
  question3: number;

  @Column({ name: 'answer_ox', type: 'varchar', length: 1, nullable: true, comment: 'O/X 답변' })
  answerOx: string;

  @Column({ name: 'answer1', type: 'bigint', nullable: true })
  answer1: number;

  @Column({ name: 'answer2', type: 'bigint', nullable: true })
  answer2: number;

  @Column({ name: 'answer3', type: 'bigint', nullable: true })
  answer3: number;

  @Column({ name: 'answer4', type: 'bigint', nullable: true })
  answer4: number;

  @Column({ name: 'answer5', type: 'bigint', nullable: true })
  answer5: number;

  @Column({ name: 'remark', type: 'text', nullable: true, comment: '메모' })
  remark: string;

  @ManyToOne(() => Quest, quest => quest.questItems)
  @JoinColumn({ name: 'quest_id' })
  quest: Quest;

  @OneToMany(() => QuestItemUnit, questItemUnit => questItemUnit.questItem)
  questItemUnits: QuestItemUnit[];
}
