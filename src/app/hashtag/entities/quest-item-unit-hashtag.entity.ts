import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Hashtag } from './hashtag.entity';
import { QuestItemUnit } from '../../quest/entities/quest-item-unit.entity'

@Entity('quest_item_unit_hashtags')
export class QuestItemUnitHashtag {
    @PrimaryGeneratedColumn({ name: 'quest_item_unit_hashtag_id' })
    questHashtagId: number;

    @Column({ name: 'quest_item_unit_id', type: 'bigint' })
    questId: number;

    @ManyToOne(() => QuestItemUnit, unit => unit.questItemUnitHashtags)
    @JoinColumn({ name: 'quest_item_unit_id' })
    questItemUnit: QuestItemUnit;

    @ManyToOne(() => Hashtag, hashtag => hashtag.questItemUnitHashtags)
    @JoinColumn({ name: 'hashtag_id' })
    hashtag: Hashtag;
}