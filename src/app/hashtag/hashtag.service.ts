import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hashtag } from './entities/hashtag.entity';
import { QuestHashtag } from './entities/quest-hashtag.entity';
import { QuestItemUnitHashtag } from './entities/quest-item-unit-hashtag.entity';
import { VocabHashtag } from './entities/vocab-hashtag.entity';


@Injectable()
export class HashtagService {
    constructor(
        @InjectRepository(Hashtag) private hashtagRepository: Repository<Hashtag>,
        @InjectRepository(QuestHashtag) private questHashtagRepository: Repository<QuestHashtag>,
        @InjectRepository(VocabHashtag) private vocabHashtagRepository: Repository<VocabHashtag>,
    ) { }

    async findAllByQuestItemUnitId(questItemUnitId: number): Promise<Hashtag[]> {
        return this.hashtagRepository
            .createQueryBuilder('h')
            .innerJoin('quest_item_unit_hashtags', 'qiuh', 'qiuh.hashtag_id = h.hashtag_id')
            .where('qiuh.quest_item_unit_id = :questItemUnitId', { questItemUnitId })
            .getMany();
    }

    async findAllByVocabularyUserId(userId: number) {
        return this.hashtagRepository
            .createQueryBuilder('h')
            .distinct(true)
            .innerJoin('vocab_hashtags', 'vh', 'vh.hashtag_id = h.hashtag_id')
            .innerJoin('vocabulary', 'v', 'v.vocab_id = vh.vocab_id')
            .where('v.user_id = :userId', { userId })
            .getMany();
    }

    async findAllByQuestItemUnitIds(ids: number[]) {
        if (!ids || ids.length === 0) {
            return [];
        }

        return this.hashtagRepository
            .createQueryBuilder('h')
            .distinct(true)
            .innerJoin('quest_item_unit_hashtags', 'qiuh', 'qiuh.hashtag_id = h.hashtag_id')
            .where('qiuh.quest_item_unit_id IN (:...ids)', { ids })
            .getMany();
    }

    async findGroupNamesByQuests(questIds: number[]) {
        if (!questIds || questIds.length === 0) {
            return [];
        }

        const rows = await this.hashtagRepository
            .createQueryBuilder('h')
            .select(['qh.quest_id AS quest_id', 'h.name AS name'])
            .innerJoin('quest_hashtags', 'qh', 'qh.hashtag_id = h.hashtag_id')
            .where('qh.quest_id IN (:...questIds)', { questIds })
            .getRawMany();

        // quest_id별로 그룹핑
        const grouped = rows.reduce((acc, row) => {
            if (!acc[row.quest_id]) {
                acc[row.quest_id] = [];
            }
            acc[row.quest_id].push(row.name);
            return acc;
        }, {} as Record<number, string[]>);

        // 객체를 배열 형태로 변환
        return Object.entries(grouped).map(([quest_id, names]) => ({
            quest_id: Number(quest_id),
            names,
        }));

    }

    async findGroupNamesByQuestItemUnits(questItemUnitIds: number[]) {
        if (!questItemUnitIds || questItemUnitIds.length === 0) {
            return [];
        }

        const rows = await this.hashtagRepository
            .createQueryBuilder('h')
            .select(['qh.quest_item_unit_id AS quest_item_unit_id', 'h.name AS name'])
            .innerJoin('quest_item_unit_hashtags', 'qh', 'qh.hashtag_id = h.hashtag_id')
            .where('qh.quest_item_unit_id IN (:...questItemUnitIds)', { questItemUnitIds })
            .getRawMany();

        // quest_item_unit_id별로 그룹핑
        const grouped = rows.reduce((acc, row) => {
            if (!acc[row.quest_item_unit_id]) {
                acc[row.quest_item_unit_id] = [];
            }
            acc[row.quest_item_unit_id].push(row.name);
            return acc;
        }, {} as Record<number, string[]>);

        // 객체를 배열 형태로 변환
        return Object.entries(grouped).map(([quest_item_unit_id, names]) => ({
            quest_item_unit_id: Number(quest_item_unit_id),
            names,
        }));
    }
}