import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quest } from './entities/quest.entity';
import { QuestItem } from './entities/quest-item.entity';
import { QuestItemUnit } from './entities/quest-item-unit.entity';
import { UserQuest } from '../user-quest/entities/user-quest.entity';
import { UserQuestItem } from '../user-quest/entities/user-quest-item.entity';
import { UserQuestProgress } from '../user-quest/entities/user-quest-progress.entity';
import { Hashtag } from '../hashtag/entities/hashtag.entity';
import { QuestItemUnitHashtag } from '../hashtag/entities/quest-item-unit-hashtag.entity';
import { QuestService } from './quest.service';
import { QuestController } from './quest.controller';
import { QuestAdminController } from './quest-admin.controller';
import { HashtagModule } from '../hashtag/hashtag.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quest,
      QuestItem,
      QuestItemUnit,
      UserQuest,
      UserQuestItem,
      UserQuestProgress,
      Hashtag,
      QuestItemUnitHashtag,
    ]),
    HashtagModule,
  ],
  controllers: [QuestController, QuestAdminController],
  providers: [QuestService],
  exports: [QuestService],
})
export class QuestModule { }
