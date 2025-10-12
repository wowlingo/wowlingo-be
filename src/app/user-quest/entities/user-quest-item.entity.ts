import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { UserQuest } from './user-quest.entity';
import { Exclude, Expose } from 'class-transformer';

@Entity('user_quest_items')
@Exclude()
export class UserQuestItem {
  @Expose()
  @PrimaryGeneratedColumn({ name: 'user_quest_item_id' })
  userQuestItemId: number;

  @Expose()
  @Column({ name: 'user_quest_id', type: 'bigint' })
  userQuestId: number;

  @Expose()
  @Column({ name: 'quest_item_id', type: 'bigint' })
  questItemId: number;

  @Expose()
  @Column({ name: 'user_answer_ox', type: 'varchar', length: 10, nullable: true, comment: 'Same/Different 답변' })
  userAnswerOx: string | null;

  @Expose()
  @Column({ name: 'user_answer_sq', type: 'varchar', length: 10, nullable: true, comment: '평서문/의문문 답변' })
  userAnswerSq: string | null;

  @Expose()
  @Column({ name: 'user_answer', type: 'bigint', nullable: true })
  userAnswer: number | null;

  @Expose()
  @Column({ name: 'correct_yn', type: 'boolean', nullable: true })
  correctYn: boolean;

  @Expose()
  @Column({ name: 'time_spent', type: 'int', nullable: true })
  timeSpent: number;

  @Expose()
  @Column({ name: 'attempt_count', type: 'int', nullable: true, default: 1 })
  attemptCount: number;

  @Expose()
  @Column({ name: 'started_at', type: 'datetime', nullable: true })
  startedAt: Date;

  @Expose()
  @Column({ name: 'ended_at', type: 'datetime', nullable: true })
  endedAt: Date;

  @ManyToOne(() => UserQuest, quest => quest.userQuestItems)
  @JoinColumn({ name: 'user_quest_id' })
  userQuest: UserQuest;

  // @OneToMany(() => QuestItemUnit, questItemUnit => questItemUnit.questItem)
  // questItemUnits: QuestItemUnit[];
}
