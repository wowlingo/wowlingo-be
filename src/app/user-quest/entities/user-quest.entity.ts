import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { UserQuestItem } from './user-quest-item.entity';
import { User } from '../../user/entities/user.entity';

@Entity('user_quests')
export class UserQuest {
    @PrimaryGeneratedColumn({ name: 'user_quest_id' })
    userQuestId: number;

    @Column({ name: 'user_id', type: 'bigint' })
    userId: number;

    @Column({ name: 'quest_id', type: 'bigint' })
    questId: number;

    @Column({ name: 'started_at', type: 'datetime', nullable: false })
    startedAt: Date;

    @Column({ name: 'ended_at', type: 'datetime', nullable: true })
    endedAt: Date | null;

    @Column({ name: 'time_spent', type: 'int', nullable: true })
    timeSpent: number | 0;

    @Column({ name: 'total_quest_item_count', type: 'int', nullable: false })
    totalQuestItemCount: number;

    @Column({ name: 'correct_quest_item_count', type: 'int', nullable: true, default: 0 })
    correctQuestItemCount: number | 0;

    @Column({
        name: 'accuracy_rate', type: 'decimal', precision: 5, scale: 2, nullable: false, default: '0.00'
    })
    accuracyRate: number;

    @ManyToOne(() => User, user => user.userQuests)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => UserQuestItem, userQuestItem => userQuestItem.userQuest, {
        cascade: false,
    })
    userQuestItems: UserQuestItem[];
}

