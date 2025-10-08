import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Hashtag } from './hashtag.entity';
import { Vocabulary } from '../../vocabulary/entities/vocabulary.entity';

@Entity('vocab_hashtags')
export class VocabHashtag {
    @PrimaryGeneratedColumn({ name: 'vocab_hashtag_id' })
    vacabHashtagId: number;

    @Column({ name: 'vocab_id', type: 'bigint' })
    vocabId: number;

    @Column({ name: 'hashtag_id', type: 'bigint' })
    hashtagId: number;

    @ManyToOne(() => Vocabulary, (vocab) => vocab.vocabHashtags)
    @JoinColumn({ name: 'vocab_id' })
    vocab: Vocabulary;

    @ManyToOne(() => Hashtag, hashtag => hashtag.questItemUnitHashtags)
    @JoinColumn({ name: 'hashtag_id' })
    hashtag: Hashtag;
}