import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserQuestController } from './user-quest.controller';
import { UserQuestService } from './user-quest.service';
import { UserQuest } from './entities/user-quest.entity';
import { UserQuestItem } from './entities/user-quest-item.entity';
import { UserQuestProgress } from './entities/user-quest-progress.entity';
import { Quest } from '../quest/entities/quest.entity';
import { QuestItem } from '../quest/entities/quest-item.entity';
import { QuestItemUnit } from '../quest/entities/quest-item-unit.entity'
import { HashtagModule } from '../hashtag/hashtag.module';
import { User } from '../user/entities/user.entity';
import { UserQuestAttempt } from '../user/entities/user-quest-attempt.entity';
import { QuestModule } from '../quest/quest.module';


@Module({
    imports: [
        TypeOrmModule.forFeature([UserQuest, UserQuestItem, UserQuestProgress, Quest, QuestItem, QuestItemUnit, User, UserQuestAttempt]),
        HashtagModule, QuestModule,
    ],
    controllers: [UserQuestController],
    providers: [UserQuestService],
})
export class UserQuestModule { }
