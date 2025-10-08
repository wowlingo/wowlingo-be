import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany, Timestamp, AfterLoad } from 'typeorm';
import { addHours, format } from 'date-fns';
import { VocabHashtag } from '../../hashtag/entities/vocab-hashtag.entity'

@Entity('vocabulary')
export class Vocabulary {
    @PrimaryGeneratedColumn({ name: 'vocab_id' })
    vocabId: number;

    @Column({ name: 'user_id', type: 'bigint' })
    userId: number;

    @Column({ name: 'str', type: 'varchar', length: 50, comment: '문자열' })
    str: string;

    @Column({ name: 'url_normal', type: 'varchar', length: 500, comment: '일반 url' })
    urlNormal: string;

    @Column({ name: 'slow_normal', type: 'varchar', length: 500, comment: '느린 url' })
    slowNormal: string;

    @Column({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @AfterLoad()
    convertUTCToKST() {
        if (this.createdAt) {
            const kstDate = addHours(this.createdAt, 9);
            this['createdAtKST'] = format(kstDate, 'yyyy-MM-dd HH:mm:ss');
        }
    }


    @OneToMany(() => VocabHashtag, (vh) => vh.vocab)
    vocabHashtags: VocabHashtag[];
}