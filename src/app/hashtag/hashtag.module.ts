import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hashtag } from './entities/hashtag.entity';
import { QuestHashtag } from './entities/quest-hashtag.entity';
import { VocabHashtag } from './entities/vocab-hashtag.entity';
import { HashtagService } from './hashtag.service';

@Module({
    imports: [TypeOrmModule.forFeature([Hashtag, QuestHashtag, VocabHashtag])],
    controllers: [],
    providers: [HashtagService],
    exports: [HashtagService],
})
export class HashtagModule { }
