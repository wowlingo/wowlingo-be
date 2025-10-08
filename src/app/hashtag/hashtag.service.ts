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
}