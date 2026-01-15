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

  @Column({ name: 'question1', type: 'bigint' }) // quest_item_unit의 id
  question1: number;

  @Column({ name: 'question2', type: 'bigint', nullable: true })
  question2: number | null;

  @Column({ name: 'answer_ox', type: 'varchar', length: 10, nullable: true, comment: 'Same/Different 답변' })
  answerOx: string | null;

  @Column({ name: 'answer_sq', type: 'varchar', length: 10, nullable: true, comment: '평서문/의문문 답변' })
  answerSq: string | null;

  // [TODO] answer1,2에 question의 값이 들어있어야 할까? 따로 string으로 들고 있으면? 선지도 문제의 일부?
  @Column({ name: 'answer1', type: 'bigint', nullable: true })
  answer1: number | null;

  @Column({ name: 'answer2', type: 'bigint', nullable: true })
  answer2: number | null;

  @Column({ name: 'remark', type: 'text', nullable: true, comment: '메모' })
  remark: string | null;

  @ManyToOne(() => Quest, quest => quest.questItems)
  @JoinColumn({ name: 'quest_id' })
  quest: Quest;
  
}
