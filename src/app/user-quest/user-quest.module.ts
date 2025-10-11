import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserQuestController } from './user-quest.controller';
import { UserQuestService } from './user-quest.service';
import { UserQuest } from './entities/user-quest.entity';
import { UserQuestItem } from './entities/user-quest-item.entity';
import { Quest } from '../quest/entities/quest.entity';
import { QuestItem } from '../quest/entities/quest-item.entity';
import { User } from '../user/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([UserQuest, UserQuestItem, Quest, QuestItem, User])],
    controllers: [UserQuestController],
    providers: [UserQuestService],
})
export class UserQuestModule { }
