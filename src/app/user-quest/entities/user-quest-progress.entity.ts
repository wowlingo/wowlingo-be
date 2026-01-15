// src/app/user-quest/entities/user-quest-progress.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { FruitType } from '../fruit.enum';

@Entity('user_quest_progress')
@Unique(['userId', 'questId'])  // !한 유저당 한 퀘스트 1개만, update
export class UserQuestProgress {
  @PrimaryGeneratedColumn({ name: 'user_quest_progress_id' })
  userQuestProgressId: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'quest_id', type: 'int' })
  questId: number;

  @Column({ name: 'total_target_count', type: 'int', default: 70, comment: '전체 문제 개수' })
  totalTargetCount: number;

  @Column({ name: 'pass_threshold', type: 'int', default: 50, comment: '통과 기준 정답 개수' })
  passThreshold: number;

  @Column({ name: 'correct_count', type: 'int', default: 0, comment: '맞힌 문제(정답) 개수' })
  correctCount: number;

  @Column({ name: 'done_yn', type: 'boolean', default: false, comment: '퀘스트 완료 여부(pass_threshold 이상 맞힌 경우)' })
  doneYn: boolean;

  @Column({ name: 'last_played_at', type: 'datetime', nullable: true })
  lastPlayedAt: Date;

  @Column({
    name: 'fruit',
    type: 'enum',
    enum: FruitType,
    default: FruitType.Apple,
    nullable: false
  })
  fruit: FruitType = FruitType.Apple;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}