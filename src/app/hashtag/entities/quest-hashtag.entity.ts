import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { Hashtag } from './hashtag.entity';

@Entity('quest_hashtags')
export class QuestHashtag {
    @PrimaryGeneratedColumn({ name: 'quest_hashtag_id' })
    questHashtagId: number;

    @Column({ name: 'quest_id', type: 'bigint' })
    questId: number;

    @Column({ name: 'hashtag_id', type: 'bigint' })
    hashtagId: number;

    // @OneToMany(() => Hashtag)
    // hashtags: Hashtag[];
}