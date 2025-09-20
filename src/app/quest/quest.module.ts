import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quest } from './entities/quest.entity';
import { QuestItem } from './entities/quest-item.entity';
import { QuestItemUnit } from './entities/quest-item-unit.entity';
import { QuestService } from './quest.service';
import { QuestController } from './quest.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Quest, QuestItem, QuestItemUnit])],
  controllers: [QuestController],
  providers: [QuestService],
  exports: [QuestService],
})
export class QuestModule {}
