import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hashtag } from './entities/hashtag.entity';
import { QuestHashtag } from './entities/quest-hashtag.entity';
import { VocabHashtag } from './entities/vocab-hashtag.entity';
import { HashtagService } from './hashtag.service';
import { HashtagController } from './hashtag.controller';
import { HashtagAdminController } from './hashtag-admin.controller';
import { QuestItemUnitHashtag } from './entities/quest-item-unit-hashtag.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Hashtag, QuestHashtag, VocabHashtag, QuestItemUnitHashtag])],
    controllers: [HashtagController, HashtagAdminController],
    providers: [HashtagService],
    exports: [HashtagService],
})
export class HashtagModule { }
