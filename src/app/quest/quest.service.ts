import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Quest } from './entities/quest.entity';
import { QuestItem } from './entities/quest-item.entity';
import { QuestItemUnit } from './entities/quest-item-unit.entity';
import { QuestDataDto, QuestItemDataDto } from './dto';
import { UserQuest } from '../user-quest/entities/user-quest.entity';
import { UserQuestItem } from '../user-quest/entities/user-quest-item.entity';
import { UserQuestProgress } from '../user-quest/entities/user-quest-progress.entity';

@Injectable()
export class QuestService {
  constructor(
    @InjectRepository(Quest)
    private questRepository: Repository<Quest>,
    @InjectRepository(QuestItem)
    private questItemRepository: Repository<QuestItem>,
    @InjectRepository(QuestItemUnit)
    private questItemUnitRepository: Repository<QuestItemUnit>,
    @InjectRepository(UserQuest)
    private userQuestRepository: Repository<UserQuest>,
    @InjectRepository(UserQuestItem)
    private userQuestItemRepository: Repository<UserQuestItem>,
    @InjectRepository(UserQuestProgress)
    private userQuestProgressRepository: Repository<UserQuestProgress>,
  ) { }

  // Quest 관련 메서드
  async findAllQuests(): Promise<Quest[]> {
    return this.questRepository.find({
    });
  }

  async findOneQuest(id: number): Promise<Quest> {
    return this.questRepository.findOneOrFail({
      where: { questId: id },
    });
  }


  // quest 랜덤으로 뽑아서 전달
  async findQuestItems(userId: number, questId: number): Promise<QuestDataDto> {
    // 1. 모든 문제 조회
    const allQuestItems = await this.questItemRepository.find({
      where: { questId },
      order: { questItemId: 'ASC' },
    });

    // 2. user_quest_progress에서 누적으로 맞힌 문제 조회
    const correctItemsResult = await this.userQuestItemRepository
      .createQueryBuilder('uqi')
      .innerJoin('user_quests', 'uq', 'uq.user_quest_id = uqi.user_quest_id')
      .where('uq.user_id = :userId', { userId })
      .andWhere('uq.quest_id = :questId', { questId })
      .andWhere('uqi.correct_yn = :correctYn', { correctYn: true })
      .select('DISTINCT uqi.quest_item_id', 'questItemId')
      .getRawMany();

    const correctItemIds = new Set(
      correctItemsResult.map(item => item.questItemId)
    );

    // 3. 아직 안 맞힌 문제들 필터링
    const remainingItems = allQuestItems.filter(
      item => !correctItemIds.has(item.questItemId)
    );

    // 4. user_quest_progress 조회 (없으면 생성)
    let progress = await this.userQuestProgressRepository.findOne({
      where: { userId, questId }
    });

    if (!progress) {
      progress = this.userQuestProgressRepository.create({
        userId,
        questId,
        totalTargetCount: 70,
        passThreshold: 50,
        correctCount: correctItemIds.size,
        doneYn: false,
      });
      await this.userQuestProgressRepository.save(progress);
    }

    // 5. 70개 출제 완료 확인
    const targetCount = progress.totalTargetCount;
    const correctCount = correctItemIds.size;

    let selectedItems: QuestItem[];

    // 70개를 다 출제했으면 남은 문제들 우선 출제
    if (correctCount >= targetCount) {
      // 남은 문제가 있으면 남은 문제들 중에서 출제
      if (remainingItems.length > 0) {
        selectedItems = this.selectRandom(remainingItems, 10);
      }
      // 남은 문제가 없으면 전체 문제에서 랜덤으로 다시 출제
      else {
        selectedItems = this.selectRandom(allQuestItems, 10);
      }
    }
    // 아직 70개를 다 출제하지 않았으면 남은 문제 중 10개 랜덤 출제
    else {
      selectedItems = this.selectRandom(remainingItems, 10);
    }

    // 6. QuestDataDto 구성 (findQuestDataById와 동일한 로직)
    const quest = await this.questRepository.findOneOrFail({
      where: { questId },
    });

    const questDataDto = new QuestDataDto();
    questDataDto.questId = quest.questId;
    questDataDto.title = quest.title;
    questDataDto.type = quest.type;

    // question과 answer unit ids 모두 가져오기
    const questUnitIds = selectedItems
      .flatMap(item => [
        item.question1, item.question2,
        item.answer1, item.answer2,
      ])
      .filter((id): id is number => id !== null);

    const questUnits = await this.questItemUnitRepository.findBy({ questItemUnitId: In(questUnitIds) });
    const questUnitMap = new Map(questUnits.map(unit => [unit.questItemUnitId, unit]));

    questDataDto.items = selectedItems.map(item => {
      const questItemDataDto = new QuestItemDataDto();
      questItemDataDto.questItemId = item.questItemId;

      const units = [item.question1, item.question2,]
        .filter(id => id)
        .flatMap(id => {
          const unit = questUnitMap.get(Number(id));
          if (!unit) {
            return [];
          }
          return [{
            id: unit.questItemUnitId,
            url: unit.urlNormal,
            type: 'normal',
          },
          {
            id: unit.questItemUnitId,
            url: unit.urlSlow,
            type: 'slow',
          }];
        });

      questItemDataDto.units = units;

      switch (quest.type) {
        case 'statement-question':
          questItemDataDto.options = [
            { type: 'statement', label: '평서문' },
            { type: 'question', label: '의문문' },
          ];
          questItemDataDto.answer = item.answerSq;

          // answerDetail 생성
          const sqQuestionUnits = [item.question1, item.question2]
            .filter((id): id is number => id !== null)
            .map(id => questUnitMap.get(Number(id))?.str)
            .filter((str): str is string => str !== undefined);
          questItemDataDto.answerDetail = {
            type: item.answerSq || 'statement',
            label: item.answerSq === 'statement' ? '평서문' : '의문문',
            units: sqQuestionUnits
          };
          break;

        case 'same-different':
          questItemDataDto.options = [
            { type: 'same', label: '같아요' },
            { type: 'different', label: '달라요' },
          ];
          questItemDataDto.answer = item.answerOx;

          // answerDetail 생성
          const sdQuestionUnits = [item.question1, item.question2]
            .filter((id): id is number => id !== null)
            .map(id => questUnitMap.get(Number(id))?.str)
            .filter((str): str is string => str !== undefined);
          questItemDataDto.answerDetail = {
            type: item.answerOx || 'same',
            label: item.answerOx === 'same' ? 'O' : 'X',
            units: sdQuestionUnits
          };
          break;

        case 'choice':
          // answer unit ids로 선택지 구성
          const answerIds = [item.answer1, item.answer2].filter((a): a is number => a !== null);
          console.log('answerIds for item:', answerIds);
          questItemDataDto.options = answerIds.map(answerId => {
            // bigint는 문자열로 반환되므로 Number로 변환
            const numericAnswerId = Number(answerId);
            const unit = questUnitMap.get(numericAnswerId);
            return {
              id: numericAnswerId,
              label: unit?.str || '',
              type: unit?.type || '',
            };
          });

          // question id들 중에서 answer id들과 일치하는 것을 찾기 (정답)
          const questions = [item.question1, item.question2].filter((q): q is number => q !== null);
          const correctAnswer = questions.find(q => answerIds.includes(q));
          questItemDataDto.answer = correctAnswer || null;

          // answerDetail 생성
          const correctAnswerUnit = correctAnswer ? questUnitMap.get(Number(correctAnswer)) : null;
          questItemDataDto.answerDetail = {
            type: String(correctAnswer || ''),
            label: correctAnswerUnit?.str || '',
            units: correctAnswerUnit ? [correctAnswerUnit.str] : []
          };
          break;

        default:
          questItemDataDto.answer = null;
          questItemDataDto.answerDetail = {
            type: '',
            label: '',
            units: []
          };
          break;
      }
      return questItemDataDto;
    });

    return questDataDto;
  }

  private selectRandom(items: any[], count: number): any[] {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
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

    // TODO:: 사용자가 풀었던 문제 중 정답인 문제는 제외

    // 문제를 섞고
    for (let i = quest.questItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [quest.questItems[i], quest.questItems[j]] = [quest.questItems[j], quest.questItems[i]];
    }

    // 문제 5개 추출. 
    const randomQuestItems = quest.questItems.slice(0, quest.questItemCount);

    // question과 answer unit ids 모두 가져오기
    const questUnitIds = randomQuestItems
      .flatMap(item => [
        item.question1, item.question2,
        item.answer1, item.answer2,
      ])
      .filter(id => id);
    const questUnits = await this.questItemUnitRepository.findBy({ questItemUnitId: In(questUnitIds) });
    const questUnitMap = new Map(questUnits.map(unit => [unit.questItemUnitId, unit]));

    questDataDto.items = randomQuestItems.map(item => {
      const questItemDataDto = new QuestItemDataDto();
      questItemDataDto.questItemId = item.questItemId;

      const units = [item.question1, item.question2,]
        .filter(id => id)
        .flatMap(id => {
          const unit = questUnitMap.get(Number(id));
          if (!unit) {
            return [];
          }
          return [{
            id: unit.questItemUnitId,
            url: unit.urlNormal,
            type: 'normal',
          },
          {
            id: unit.questItemUnitId,
            url: unit.urlSlow,
            type: 'slow',
          }];
        });

      questItemDataDto.units = units;

      switch (quest.type) {
        case 'statement-question':
          questItemDataDto.options = [
            { type: 'statement', label: '평서문' },
            { type: 'question', label: '의문문' },
          ];
          questItemDataDto.answer = item.answerSq;

          // answerDetail 생성
          const sqQuestionUnits = [item.question1, item.question2]
            .filter((id): id is number => id !== null)
            .map(id => questUnitMap.get(Number(id))?.str)
            .filter((str): str is string => str !== undefined);
          questItemDataDto.answerDetail = {
            type: item.answerSq || 'statement',
            label: item.answerSq === 'statement' ? '평서문' : '의문문',
            units: sqQuestionUnits
          };
          break;

        case 'same-different':
          questItemDataDto.options = [
            { type: 'same', label: '같아요' },
            { type: 'different', label: '달라요' },
          ];
          questItemDataDto.answer = item.answerOx;

          // answerDetail 생성
          const sdQuestionUnits = [item.question1, item.question2]
            .filter((id): id is number => id !== null)
            .map(id => questUnitMap.get(Number(id))?.str)
            .filter((str): str is string => str !== undefined);
          questItemDataDto.answerDetail = {
            type: item.answerOx || 'same',
            label: item.answerOx === 'same' ? 'O' : 'X',
            units: sdQuestionUnits
          };
          break;

        case 'choice':
          // answer unit ids로 선택지 구성
          const answerIds = [item.answer1, item.answer2].filter((a): a is number => a !== null);
          questItemDataDto.options = answerIds.map(answerId => {
            // bigint는 문자열로 반환되므로 Number로 변환
            const numericAnswerId = Number(answerId);
            const unit = questUnitMap.get(numericAnswerId);
            return {
              id: numericAnswerId,
              label: unit?.str || '',
              type: unit?.type || '',
            };
          });

          // question id들 중에서 answer id들과 일치하는 것을 찾기 (정답)
          const questions = [item.question1, item.question2].filter((q): q is number => q !== null);
          const correctAnswer = questions.find(q => answerIds.includes(q));
          questItemDataDto.answer = correctAnswer || null;

          // answerDetail 생성
          const correctAnswerUnit = correctAnswer ? questUnitMap.get(Number(correctAnswer)) : null;
          questItemDataDto.answerDetail = {
            type: String(correctAnswer || ''),
            label: correctAnswerUnit?.str || '',
            units: correctAnswerUnit ? [correctAnswerUnit.str] : []
          };
          break;

        default:
          questItemDataDto.answer = null;
          questItemDataDto.answerDetail = {
            type: '',
            label: '',
            units: []
          };
          break;
      }
      return questItemDataDto;
    });

    return questDataDto;
  }

  async updateQuest(id: number,questData: Partial<Quest>): Promise<Quest> {
    await this.questRepository.update(id, questData);
    return this.findOneQuest(id);
  }

  async removeQuest(id: number): Promise<void> {
    await this.questRepository.delete(id);
  }

  async findQuestById(id: number): Promise<Quest> {
    return this.questRepository.findOneOrFail({
      where: { questId: id },
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
      // relations: ['questItem'],
    });
  }

  async createQuestItemUnit(questItemUnitData: Partial<QuestItemUnit>): Promise<QuestItemUnit> {
    const questItemUnit = this.questItemUnitRepository.create(questItemUnitData);
    return this.questItemUnitRepository.save(questItemUnit);
  }
}
