import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { QuestItemUnit } from '../quest/entities/quest-item-unit.entity';
import { Vocabulary } from './entities/vocabulary.entity';
import { Hashtag } from '../hashtag/entities/hashtag.entity';
import { VocabHashtag } from '../hashtag/entities/vocab-hashtag.entity';

@Injectable()
export class VocabularyService {
    constructor(
        @InjectDataSource()
        private dataSource: DataSource,
        @InjectRepository(Vocabulary)
        private vocabularyRepository: Repository<Vocabulary>,
    ) { }

    async createVocab(userId: number, hashtags: Hashtag[], questItemUnit: QuestItemUnit): Promise<Vocabulary> {
        return await this.vocabularyRepository.manager.transaction(async (manager) => {
            // 중복 체크: 같은 userId와 str을 가진 vocabulary가 이미 있는지 확인
            const existingVocab = await manager.findOne(Vocabulary, {
                where: {
                    userId,
                    str: questItemUnit.str,
                },
            });

            let savedVocab: Vocabulary;

            if (existingVocab) {
                // 이미 존재하면 created_at 업데이트 (날짜 갱신)
                existingVocab.createdAt = new Date();
                savedVocab = await manager.save(existingVocab);

                await manager.delete(VocabHashtag, {
                    vocabId: savedVocab.vocabId,
                });
            } else {
                const vocab = manager.create(Vocabulary, {
                    userId,
                    str: questItemUnit.str,
                    urlNormal: questItemUnit.urlNormal,
                    slowNormal: questItemUnit.urlSlow,
                    createdAt: new Date(),
                });
                savedVocab = await manager.save(vocab);
            }

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
        } else if (sort === 'asc') {
            query.orderBy('v.str', 'ASC');
        } else { // desc
            query.orderBy('v.str', 'DESC');
        }

        return query.getMany();
    }

    async removeVoca(id: number): Promise<void> {

        await this.dataSource.transaction(async (transactionalEntityManager) => {
            await transactionalEntityManager.delete(VocabHashtag, {
                vocab: { vocabId: id }
            });

            await transactionalEntityManager.delete(Vocabulary, id);
        });
    }

}