import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { formatInTimeZone } from 'date-fns-tz';
import { QuestItemUnit } from '../quest/entities/quest-item-unit.entity';
import { Vocabulary } from './entities/vocabulary.entity';
import { Hashtag } from '../hashtag/entities/hashtag.entity';
import { VocabHashtag } from '../hashtag/entities/vocab-hashtag.entity';

@Injectable()
export class VocabularyService {
    constructor(
        @InjectRepository(Vocabulary)
        private vocabularyRepository: Repository<Vocabulary>,
    ) { }

    async createVocab(userId: number, hashtags: Hashtag[], questItemUnit: QuestItemUnit): Promise<Vocabulary> {
        // const kstDate = formatInTimeZone(new Date(), 'Asia/Seoul', "yyyy-MM-dd HH:mm:ss");

        return await this.vocabularyRepository.manager.transaction(async (manager) => {
            // vocabulary 먼저 insert
            const vocab = manager.create(Vocabulary, {
                userId,
                str: questItemUnit.str,
                urlNormal: questItemUnit.urlNormal,
                slowNormal: questItemUnit.urlSlow,
                createdAt: new Date(),
            });
            const savedVocab = await manager.save(vocab);

            // vocab_hashtags insert
            const vocabHashtags = hashtags.map((hashtag) =>
                manager.create(VocabHashtag, {
                    vocabId: savedVocab.vocabId,
                    hashtagId: hashtag.hashtagId,
                }),
            );

            await manager.save(VocabHashtag, vocabHashtags);

            return savedVocab;
        });
    }

    async findAllByHashtags(
        userId: number,
        hashtagIds: number[] | null,
        sort?: string | null,
    ): Promise<Vocabulary[]> {
        let query = this.vocabularyRepository
            .createQueryBuilder('v')
            .innerJoin('v.vocabHashtags', 'vh')
            .where('v.user_id = :userId', { userId });

        if (hashtagIds && hashtagIds.length > 0)
            query.andWhere('vh.hashtag_id IN (:...hashtagIds)', { hashtagIds });

        // 정렬 옵션 처리 (옵션)
        if (sort === 'latest') {
            query.orderBy('v.created_at', 'DESC');
        } else if (sort === 'oldest') {
            query.orderBy('v.created_at', 'ASC');
        } else {
            query.orderBy('v.created_at', 'DESC');
        }

        return query.getMany();
    }

}