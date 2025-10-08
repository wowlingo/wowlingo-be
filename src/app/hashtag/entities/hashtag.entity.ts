import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { QuestItemUnitHashtag } from './quest-item-unit-hashtag.entity'

@Entity('hashtags')
export class Hashtag {
    @PrimaryGeneratedColumn({ name: 'hashtag_id' })
    hashtagId: number;

    @Column({ name: 'code', type: 'varchar', length: 16, comment: '해시태그 코드' })
    code: string;

    @Column({ name: 'name', type: 'varchar', length: 50, comment: '해시태그 문자열' })
    name: string;

    @OneToMany(() => QuestItemUnitHashtag, qiuh => qiuh.hashtag)
    questItemUnitHashtags: QuestItemUnitHashtag[];
}