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

  @Column({ name: 'question1', type: 'text', nullable: true })
  question1: string;

  @Column({ name: 'question2', type: 'text', nullable: true })
  question2: string;

  @Column({ name: 'question3', type: 'text', nullable: true })
  question3: string;

  @Column({ name: 'answer_ox', type: 'varchar', length: 1, nullable: true, comment: 'O/X 답변' })
  answerOx: string;

  @Column({ name: 'answer1', type: 'text', nullable: true })
  answer1: string;

  @Column({ name: 'answer2', type: 'text', nullable: true })
  answer2: string;

  @Column({ name: 'answer3', type: 'text', nullable: true })
  answer3: string;

  @Column({ name: 'answer4', type: 'text', nullable: true })
  answer4: string;

  @Column({ name: 'answer5', type: 'text', nullable: true })
  answer5: string;

  @ManyToOne(() => Quest, quest => quest.questItems)
  @JoinColumn({ name: 'quest_id' })
  quest: Quest;

  @OneToMany(() => QuestItemUnit, questItemUnit => questItemUnit.questItem)
  questItemUnits: QuestItemUnit[];
}
