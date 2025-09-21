import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Quest } from './entities/quest.entity';
import { QuestItem } from './entities/quest-item.entity';
import { QuestItemUnit } from './entities/quest-item-unit.entity';
import { QuestDataDto, QuestItemDataDto } from './dto';

@Injectable()
export class QuestService {
  constructor(
    @InjectRepository(Quest)
    private questRepository: Repository<Quest>,
    @InjectRepository(QuestItem)
    private questItemRepository: Repository<QuestItem>,
    @InjectRepository(QuestItemUnit)
    private questItemUnitRepository: Repository<QuestItemUnit>,
  ) { }

  // Quest 관련 메서드
  async findAllQuests(): Promise<Quest[]> {
    return this.questRepository.find({
      relations: ['questItems', 'course'],
    });
  }

  async findQuestDataById(id: number): Promise<QuestDataDto> {
    const quest = await this.questRepository.findOneOrFail({
      where: { questId: id },
      relations: ['questItems'],
    });

    const questDataDto = new QuestDataDto();
    questDataDto.questId = quest.questId;
    questDataDto.title = quest.title;
    questDataDto.type = quest.type;

    // TODO:: 사용자가 풀었던 문제 중 오답인 문제는 제외.

    // 문제를 섞고
    for (let i = quest.questItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [quest.questItems[i], quest.questItems[j]] = [quest.questItems[j], quest.questItems[i]];
    }

    // 문제 5개 추출. 
    const randomQuestItems = quest.questItems.slice(0, quest.questItemCount);

    const questUnitIds = randomQuestItems
      .flatMap(item => [item.question1, item.question2, item.question3])
      .filter(id => id);
    const questUnits = await this.questItemUnitRepository.findBy({ questItemUnitId: In(questUnitIds) });
    const questUnitMap = new Map(questUnits.map(unit => [unit.questItemUnitId, unit]));

    questDataDto.items = randomQuestItems.map(item => {
      const questItemDataDto = new QuestItemDataDto();

      const units = [item.question1, item.question2, item.question3]
        .filter(id => id)
        .flatMap(id => {
          const unit = questUnitMap.get(Number(id));
          if (!unit) {
            return [];
          }
          return [{
            id: unit.questItemUnitId,
            url: unit.urlNormal,
            type: unit.type,
          }];
        });

      questItemDataDto.units = units;

      switch (quest.type) {
        case 'statement-question':
          // questItemDataDto.options = [
          //   { type: 'statement', label: '평서문' },
          //   { type: 'question', label: '의문문' },
          // ];
          questItemDataDto.answer = item.answerSq;
          break;
        case 'same-different':
          // questItemDataDto.options = [
          //   { type: 'same', label: '같아요' },
          //   { type: 'different', label: '달라요' },
          // ];
          questItemDataDto.answer = item.answerOx;
          break;
        default:
          // questItemDataDto.options = [];
          questItemDataDto.answer = '';
      }
      return questItemDataDto;
    });

    return questDataDto;
  }

  async findQuestById(id: number): Promise<Quest> {
    return this.questRepository.findOneOrFail({
      where: { questId: id },
      relations: ['questItems', 'course'],
    });
  }

  async findQuestsByCourseId(courseId: number): Promise<Quest[]> {
    return this.questRepository.find({
      where: { courseId },
      relations: ['questItems'],
    });
  }

  async createQuest(questData: Partial<Quest>): Promise<Quest> {
    const quest = this.questRepository.create(questData);
    return this.questRepository.save(quest);
  }

  // QuestItem 관련 메서드
  async findAllQuestItems(): Promise<QuestItem[]> {
    return this.questItemRepository.find({
      relations: ['quest', 'questItemUnits'],
    });
  }

  async findQuestItemById(id: number): Promise<QuestItem> {
    return this.questItemRepository.findOneOrFail({
      where: { questItemId: id },
      relations: ['quest', 'questItemUnits'],
    });
  }

  async findQuestItemsByQuestId(questId: number): Promise<QuestItem[]> {
    return this.questItemRepository.find({
      where: { questId },
      relations: ['questItemUnits'],
    });
  }

  async createQuestItem(questItemData: Partial<QuestItem>): Promise<QuestItem> {
    const questItem = this.questItemRepository.create(questItemData);
    return this.questItemRepository.save(questItem);
  }

  // QuestItemUnit 관련 메서드
  async findAllQuestItemUnits(): Promise<QuestItemUnit[]> {
    return this.questItemUnitRepository.find({
      relations: ['questItem'],
    });
  }

  async findQuestItemUnitById(id: number): Promise<QuestItemUnit> {
    return this.questItemUnitRepository.findOneOrFail({
      where: { questItemUnitId: id },
      relations: ['questItem'],
    });
  }

  async findQuestItemUnitsByQuestItemId(questItemId: number): Promise<QuestItemUnit[]> {
    return this.questItemUnitRepository.find({
      // where: { questItemId },
    });
  }

  async createQuestItemUnit(questItemUnitData: Partial<QuestItemUnit>): Promise<QuestItemUnit> {
    const questItemUnit = this.questItemUnitRepository.create(questItemUnitData);
    return this.questItemUnitRepository.save(questItemUnit);
  }
}
