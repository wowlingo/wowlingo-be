import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, AfterLoad } from 'typeorm';
import { User } from './user.entity';
import { addHours, format } from 'date-fns';

@Entity('user_quest_attempts')
export class UserQuestAttempt {
    @PrimaryGeneratedColumn({ name: 'user_quest_attempt_id' })
    userQuestAttemptId: number;

    @Column({ name: 'user_id', type: 'bigint' })
    userId: number;

    @Column({ name: 'login_date', type: 'timestamp', comment: '로그인 날짜' })
    loginDate: Date;

    @Column({ name: 'attempt_date', type: 'timestamp', nullable: true, comment: '학습 시도 날짜' })
    attemptDate: Date | null;

    @Column({ name: 'ai_feedback_id', type: 'bigint', nullable: true, comment: 'AI 피드백 Id' })
    aiFeedbackId: number | null;


    @AfterLoad()
    convertUTCToKST() {
        if (this.loginDate) {
            const kstDate = addHours(this.loginDate, 9);
            this['loginDateKST'] = format(kstDate, 'yyyy-MM-dd HH:mm:ss');
        } else {
            this['loginDateKST'] = '';
        }

        if (this.attemptDate) {
            const kstDate = addHours(this.attemptDate, 9);
            this['attemptDateKST'] = format(kstDate, 'yyyy-MM-dd HH:mm:ss');
        } else {
            this['attemptDateKST'] = '';
        }
    }

    @ManyToOne(() => User, user => user.userQuestAttempts)
    @JoinColumn({ name: 'user_id' })
    user: User;
}