import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vocabulary } from './entities/vocabulary.entity';
import { VocabularyService } from './vocabulary.service';
import { VocabularyController } from './vocabulary.controller';
import { UserModule } from '../user/user.module';
import { QuestModule } from '../quest/quest.module';
import { HashtagModule } from '../hashtag/hashtag.module';

@Module({
    imports: [TypeOrmModule.forFeature([Vocabulary]), QuestModule, HashtagModule],
    controllers: [VocabularyController],
    providers: [VocabularyService],
    exports: [VocabularyService],
})
export class VocabularyModule { }
