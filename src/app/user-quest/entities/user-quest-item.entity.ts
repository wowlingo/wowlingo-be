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
  @Column({ name: 'user_answer_ox', type: 'varchar', length: 1, nullable: true, comment: 'O/X 답변' })
  userAnswerOx: string | null;;

  @Expose()
  @Column({ name: 'user_answer_sq', type: 'varchar', length: 10, nullable: true, comment: '평서문/의문문 답변' })
  userAnswerSq: string | null;;

  @Expose()
  @Column({ name: 'user_answer', type: 'bigint', nullable: true })
  userAnswer: number | null;;

  @Expose()
  @Column({ name: 'correct_yn', type: 'boolean', nullable: true })
  correctYn: boolean;

  @Expose()
  @Column({ name: 'attempt_at', type: 'datetime', nullable: true })
  attemptAt: Date;

  @Expose()
  @Column({ name: 'temp_spent', type: 'int', nullable: true })
  timeSpent: number;

  @Expose()
  @Column({ name: 'quest_item', type: 'json', nullable: true })
  questItem: string | null;

  @ManyToOne(() => UserQuest, quest => quest.userQuestItems)
  @JoinColumn({ name: 'user_quest_id' })
  userQuest: UserQuest;

  // @OneToMany(() => QuestItemUnit, questItemUnit => questItemUnit.questItem)
  // questItemUnits: QuestItemUnit[];
}
