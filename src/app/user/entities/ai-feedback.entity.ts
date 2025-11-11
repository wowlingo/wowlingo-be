import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, AfterLoad } from 'typeorm';
import { UserQuestAttempt } from './user-quest-attempt.entity';
import { addHours, format } from 'date-fns';

@Entity('ai_feedbacks')
export class AiFeedback {
    @PrimaryGeneratedColumn({ name: 'ai_feedback_id' })
    aiFeedbackId: number;

    @Column({ name: 'user_quest_attempt_id', type: 'bigint' })
    userQuestAttemptId: number;

    @Column({ name: 'created_at', type: 'timestamp', comment: 'AI 생성 날짜' })
    createdAt: Date;

    @Column({ name: 'title', type: 'varchar', length: 100, comment: 'AI 타이틀', nullable: true})
    title: string | null;

    @Column({ name: 'message', type: 'varchar', length: 500, comment: 'AI 내용', nullable: true})
    message: string | null;

    @ManyToOne(() => UserQuestAttempt)
    @JoinColumn({ name: 'user_quest_attempt_id' }) // 이 컬럼을 기준으로 조인
    userQuestAttempt: UserQuestAttempt;

    @AfterLoad()
    convertUTCToKST() {
        if (this.createdAt) {
            const kstDate = addHours(this.createdAt, 9);
            this['createdDateKST'] = format(kstDate, 'yyyy-MM-dd HH:mm:ss');
        } else {
            this['createdDateKST'] = '';
        }
    }

}