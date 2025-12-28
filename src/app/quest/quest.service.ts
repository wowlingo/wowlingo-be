import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, DataSource } from 'typeorm';
import { Quest } from './entities/quest.entity';
import { QuestItem } from './entities/quest-item.entity';
import { QuestItemUnit } from './entities/quest-item-unit.entity';
import { QuestDataDto, QuestItemDataDto } from './dto';
import { UserQuest } from '../user-quest/entities/user-quest.entity';
import { UserQuestItem } from '../user-quest/entities/user-quest-item.entity';
import { UserQuestProgress } from '../user-quest/entities/user-quest-progress.entity';
import { AdminQuestResDto } from './dto/admin-quest-res.dto';
import { Hashtag } from '../hashtag/entities/hashtag.entity';
import { AdminQuestItemResDto } from './dto/admin-quest-item-res.dto';
import { AdminQuestItemUnitResDto } from './dto/admin-quest-item-unit-res.dto';
import { QuestResDto } from './dto/quest-res.dto';
import { QuestItemUnitHashtag } from '../hashtag/entities/quest-item-unit-hashtag.entity';
import { QuestHashtag } from '../hashtag/entities/quest-hashtag.entity';
import { CreateQuestItemUnitDto } from './dto/create-quest-item-unit.dto';
import { UpdateQuestItemUnitDto } from './dto/update-quest-item-unit.dto';
import { CreateQuestItemDto } from './dto/create-quest-item.dto';
import { UpdateQuestItemDto } from './dto/update-quest-item.dto';
import { CreateQuestDto } from './dto/create-quest.dto';
import { UpdateQuestDto } from './dto/update-quest.dto';


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
    @InjectRepository(Hashtag)
    private hashtagRepository: Repository<Hashtag>,
    @InjectRepository(QuestItemUnitHashtag)
    private questItemUnitHashtagRepository: Repository<QuestItemUnitHashtag>,
    @InjectRepository(QuestHashtag)
    private questHashtagRepository: Repository<QuestHashtag>,
    private dataSource: DataSource,
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
        passThreshold: 56,
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
            type: item.type || '',
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

  async updateQuest(id: number, questData: Partial<Quest>): Promise<Quest> {
    await this.questRepository.update(id, questData);
    return this.findOneQuest(id);
  }

  async removeQuest(id: number): Promise<void> {
    const quest = await this.questRepository.findOne({
      where: { questId: id },
    });

    if (!quest) {
      throw new NotFoundException(`Quest with ID ${id} not found`);
    }

    const questItemsCount = await this.questItemRepository.count({
      where: { questId: id },
    });

    if (questItemsCount > 0) {
      throw new BadRequestException(
        `이 Quest는 ${questItemsCount}개의 Quest Item이 등록되어 있습니다. Quest를 삭제하려면 먼저 모든 Quest Item을 삭제해주세요.`,
      );
    }

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

  /**
   * Quest 생성 with Hashtag 연결
   */
  async createQuestWithHashtags(dto: CreateQuestDto): Promise<Quest> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // hashtagIds가 제공되었다면 검증
      if (dto.hashtagIds && dto.hashtagIds.length > 0) {
        const hashtags = await this.hashtagRepository.findBy({
          hashtagId: In(dto.hashtagIds),
        });

        if (hashtags.length !== dto.hashtagIds.length) {
          throw new BadRequestException('일부 해시태그를 찾을 수 없습니다.');
        }
      }

      // Quest 생성
      const quest = queryRunner.manager.create(Quest, {
        title: dto.title,
        type: dto.type,
        order: dto.order,
        questItemCount: dto.questItemCount,
      });
      const savedQuest = await queryRunner.manager.save(Quest, quest);

      // Quest-Hashtag 연결
      if (dto.hashtagIds && dto.hashtagIds.length > 0) {
        const questHashtags = dto.hashtagIds.map(hashtagId =>
          queryRunner.manager.create(QuestHashtag, {
            questId: savedQuest.questId,
            hashtagId: hashtagId,
          }),
        );
        await queryRunner.manager.save(QuestHashtag, questHashtags);
      }

      await queryRunner.commitTransaction();
      return savedQuest;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Quest 수정 with Hashtag 재연결
   */
  async updateQuestWithHashtags(id: number, dto: UpdateQuestDto): Promise<Quest> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingQuest = await this.questRepository.findOne({
        where: { questId: id },
      });

      if (!existingQuest) {
        throw new NotFoundException(`Quest ID ${id}를 찾을 수 없습니다.`);
      }

      // Quest 기본 정보 업데이트
      const updateData: Partial<Quest> = {};
      if (dto.title) updateData.title = dto.title;
      if (dto.type) updateData.type = dto.type;
      if (dto.order !== undefined) updateData.order = dto.order;
      if (dto.questItemCount !== undefined) updateData.questItemCount = dto.questItemCount;

      await queryRunner.manager.update(Quest, id, updateData);

      // Hashtag 재연결 (hashtagIds가 제공되었을 경우에만)
      if (dto.hashtagIds !== undefined) {
        if (dto.hashtagIds.length > 0) {
          // 해시태그 검증
          const hashtags = await this.hashtagRepository.findBy({
            hashtagId: In(dto.hashtagIds),
          });

          if (hashtags.length !== dto.hashtagIds.length) {
            throw new BadRequestException('일부 해시태그를 찾을 수 없습니다.');
          }
        }

        // 기존 연결 삭제
        await queryRunner.manager.delete(QuestHashtag, { questId: id });

        // 새로운 연결 생성
        if (dto.hashtagIds.length > 0) {
          const questHashtags = dto.hashtagIds.map(hashtagId =>
            queryRunner.manager.create(QuestHashtag, {
              questId: id,
              hashtagId: hashtagId,
            }),
          );
          await queryRunner.manager.save(QuestHashtag, questHashtags);
        }
      }

      await queryRunner.commitTransaction();

      // 업데이트된 Quest 반환
      return this.findOneQuest(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // QuestItem 관련 메서드
  async findAllQuestItems(): Promise<QuestItem[]> {
    return this.questItemRepository.find({
      // relations: ['quest', 'questItemUnits'],
      relations: ['quest'],
    });
  }

  async findQuestItemById(id: number): Promise<QuestItem> {
    return this.questItemRepository.findOneOrFail({
      where: { questItemId: id },
      relations: ['quest'],
    });
  }

  async findQuestItemsByQuestId(questId: number): Promise<QuestItem[]> {
    return this.questItemRepository.find({
      where: { questId },
    });
  }

  async createQuestItem(questItemData: Partial<QuestItem>): Promise<QuestItem> {
    const questItem = this.questItemRepository.create(questItemData);
    return this.questItemRepository.save(questItem);
  }

  // QuestItemUnit 관련 메서드
  async findAllQuestItemUnits(): Promise<QuestItemUnit[]> {
    return this.questItemUnitRepository.find({
      // relations: ['questItem'],
    });
  }

  async findQuestItemUnitById(id: number): Promise<QuestItemUnit> {
    return this.questItemUnitRepository.findOneOrFail({
      where: { questItemUnitId: id },
      // relations: ['questItem'],
    });
  }

  async findQuestItemUnitsByIds(ids: number[]): Promise<QuestItemUnit[]> {
    if (!ids || ids.length === 0) {
      return [];
    }
    return this.questItemUnitRepository.findBy({
      questItemUnitId: In(ids),
    });
  }

  async createQuestItemUnit(questItemUnitData: Partial<QuestItemUnit>): Promise<QuestItemUnit> {
    const questItemUnit = this.questItemUnitRepository.create(questItemUnitData);
    return this.questItemUnitRepository.save(questItemUnit);
  }

  async makeQuestsAdmin(quests: Quest[], hashtags: any[]): Promise<AdminQuestResDto[]> {
    const hashtagMap = new Map<number, string[]>();
    for (const hashtag of hashtags) {
      hashtagMap.set(hashtag.quest_id, hashtag.names);
    }

    // 각 Quest의 실제 등록된 Quest Item 개수 조회
    const questIds = quests.map(q => q.questId);
    const itemCounts = await this.questItemRepository
      .createQueryBuilder('qi')
      .select('qi.quest_id', 'questId')
      .addSelect('COUNT(*)', 'count')
      .where('qi.quest_id IN (:...questIds)', { questIds })
      .groupBy('qi.quest_id')
      .getRawMany();

    const itemCountMap = new Map<number, number>();
    for (const item of itemCounts) {
      itemCountMap.set(Number(item.questId), Number(item.count));
    }

    return quests.map(quest => {
      const adminQuestResDto = new AdminQuestResDto();
      adminQuestResDto.questId = quest.questId;
      adminQuestResDto.title = quest.title;
      adminQuestResDto.type = quest.type;
      adminQuestResDto.order = quest.order;
      adminQuestResDto.questItemCount = quest.questItemCount;
      adminQuestResDto.actualItemCount = itemCountMap.get(quest.questId) || 0;
      adminQuestResDto.hashtags = hashtagMap.get(quest.questId) || [];
      return adminQuestResDto;
    });
  }

  async makeQuestItemUnitsAdmin(questItemUnits: QuestItemUnit[], hashtags: any[]): Promise<AdminQuestItemUnitResDto[]> {
    const hashtagMap = new Map<number, string[]>();
    for (const hashtag of hashtags) {
      hashtagMap.set(hashtag.quest_item_unit_id, hashtag.names);
    }

    return questItemUnits.map(questItemUnit => {
      const adminQuestItemUnitResDto = new AdminQuestItemUnitResDto();
      adminQuestItemUnitResDto.questItemUnitId = questItemUnit.questItemUnitId;
      adminQuestItemUnitResDto.str = questItemUnit.str;
      adminQuestItemUnitResDto.type = questItemUnit.type;
      adminQuestItemUnitResDto.urlNormal = questItemUnit.urlNormal;
      adminQuestItemUnitResDto.urlSlow = questItemUnit.urlSlow;
      adminQuestItemUnitResDto.hashtags = hashtagMap.get(questItemUnit.questItemUnitId) || [];
      return adminQuestItemUnitResDto;
    });
  }

  async findQuestItemUnitsByQuest1QuestItemIds(questItemIds: number[]) {

    return this.findQuestItemUnitsByQuestItemIds(questItemIds, 'question1');
  }

  async findQuestItemUnitsByQuest2QuestItemIds(questItemIds: number[]) {

    return this.findQuestItemUnitsByQuestItemIds(questItemIds, 'question2');
  }


  private async findQuestItemUnitsByQuestItemIds(
    questItemIds: number[],
    joinColumn: 'question1' | 'question2'
  ): Promise<{ quest_item_id: number; unit: QuestItemUnit }[]> {
    if (!questItemIds || questItemIds.length === 0) {
      return [];
    }

    const rows = await this.questItemUnitRepository.createQueryBuilder('qiu')
      .select('qiu.*')
      .addSelect('qi.quest_item_id', 'grouping_key')
      .innerJoin('quest_items', 'qi', `qi.${joinColumn} = qiu.quest_item_unit_id`)
      .where('qi.quest_item_id IN (:...questItemIds)', { questItemIds })
      .getRawMany();

    // // quest_id별로 그룹핑
    // const grouped = rows.reduce((acc, row) => {
    //   const key = row.grouping_key;
    //   if (!acc[key]) {
    //     acc[key] = [];
    //   }
    //   acc[key].push(row);
    //   return acc;
    // }, {} as Record<number, QuestItemUnit>);

    // 객체를 배열 형태로 변환
    // return Object.entries(grouped).map(([quest_item_id, unit]) => ({
    //   quest_item_id: Number(quest_item_id),
    //   unit,
    // }));

    return rows.map(row => {
      const { grouping_key, ...unitProperties } = row;

      return {
        quest_item_id: Number(grouping_key),
        unit: unitProperties as QuestItemUnit,
      };
    });

  }

  async makeQuestItemsAdmin(
    questItems: QuestItem[],
    questItemUnits1: { quest_item_id: number; unit: QuestItemUnit; }[],
    questItemUnits2: { quest_item_id: number; unit: QuestItemUnit; }[],
    questItemUnits: QuestItemUnit[],
  ): Promise<AdminQuestItemResDto[]> {

    const questItemUnitMap1 = new Map<number, QuestItemUnit>();
    for (const questItemUnit of questItemUnits1) {
      questItemUnitMap1.set(questItemUnit.quest_item_id, questItemUnit.unit);
    }

    const questItemUnitMap2 = new Map<number, QuestItemUnit>();
    for (const questItemUnit of questItemUnits2) {
      questItemUnitMap2.set(questItemUnit.quest_item_id, questItemUnit.unit);
    }

    const unitByIdMap = new Map<number, QuestItemUnit>();
    for (const unit of questItemUnits) {
      unitByIdMap.set(unit.questItemUnitId, unit);
    }

    return questItems.map(questItem => {
      const adminQuestItemResDto = new AdminQuestItemResDto();

      adminQuestItemResDto.questItemId = questItem.questItemId;
      adminQuestItemResDto.questId = questItem.questId;
      adminQuestItemResDto.type = questItem.type;
      adminQuestItemResDto.answerOx = questItem.answerOx;
      adminQuestItemResDto.answerSq = questItem.answerSq;
      adminQuestItemResDto.answer1 = questItemUnits?.find(unit => unit.questItemUnitId == questItem.answer1)?.str ?? null;
      adminQuestItemResDto.answer2 = questItemUnits?.find(unit => unit.questItemUnitId == questItem.answer2)?.str ?? null;
      adminQuestItemResDto.remark = questItem.remark;
      adminQuestItemResDto.quest = questItem.quest || null;
      adminQuestItemResDto.questUnit1 = questItemUnitMap1.get(questItem.questItemId) || null;
      adminQuestItemResDto.questUnit2 = questItemUnitMap2.get(questItem.questItemId) || null;
      adminQuestItemResDto.answerUnit1 = questItem.answer1 ? unitByIdMap.get(Number(questItem.answer1)) || null : null;
      adminQuestItemResDto.answerUnit2 = questItem.answer2 ? unitByIdMap.get(Number(questItem.answer2)) || null : null;

      return adminQuestItemResDto;
    });
  }

  async makeQuests(quests: Quest[], hashtags: any[]): Promise<QuestResDto[]> {
    const hashtagMap = new Map<number, string[]>();
    for (const hashtag of hashtags) {
      hashtagMap.set(hashtag.quest_id, hashtag.names);
    }

    return quests.map(quest => {
      const questResDto = new QuestResDto();
      questResDto.questId = quest.questId;
      questResDto.questItemCount = quest.questItemCount;
      questResDto.order = quest.order;
      questResDto.title = quest.title;
      questResDto.type = quest.type;
      questResDto.hashtags = hashtagMap.get(quest.questId) || [];
      return questResDto;
    });
  }

  /**
   * Unit 생성 with Hashtag 연결
   */
  async createQuestItemUnitWithHashtags(dto: CreateQuestItemUnitDto): Promise<QuestItemUnit> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hashtags = await this.hashtagRepository.findBy({
        hashtagId: In(dto.hashtagIds),
      });

      if (hashtags.length !== dto.hashtagIds.length) {
        throw new BadRequestException('일부 해시태그를 찾을 수 없습니다.');
      }

      // Unit의 type 필드에 첫 번째 Hashtag의 code 저장 (backward compatibility)
      // TODO unit.type 규칙 필요
      const primaryHashtagCode = hashtags[0]?.code || 'word';

      const questItemUnit = queryRunner.manager.create(QuestItemUnit, {
        str: dto.str,
        type: primaryHashtagCode,
        urlNormal: dto.urlNormal,
        urlSlow: dto.urlSlow,
        remark: dto.remark,
      });
      const savedUnit = await queryRunner.manager.save(QuestItemUnit, questItemUnit);

      const unitHashtags = dto.hashtagIds.map(hashtagId =>
        queryRunner.manager.create(QuestItemUnitHashtag, {
          questId: savedUnit.questItemUnitId,
          hashtag: { hashtagId },
          questItemUnit: savedUnit,
        }),
      );
      await queryRunner.manager.save(QuestItemUnitHashtag, unitHashtags);

      await queryRunner.commitTransaction();
      return savedUnit;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Unit 수정 with Hashtag 재연결
   */
  async updateQuestItemUnitWithHashtags(
    id: number,
    dto: UpdateQuestItemUnitDto,
  ): Promise<QuestItemUnit> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingUnit = await this.questItemUnitRepository.findOne({
        where: { questItemUnitId: id },
      });

      if (!existingUnit) {
        throw new NotFoundException(`Unit ID ${id}를 찾을 수 없습니다.`);
      }

      const updateData: Partial<QuestItemUnit> = {};
      if (dto.str) updateData.str = dto.str;
      if (dto.urlNormal) updateData.urlNormal = dto.urlNormal;
      if (dto.urlSlow) updateData.urlSlow = dto.urlSlow;
      if (dto.remark !== undefined) updateData.remark = dto.remark;

      if (dto.hashtagIds && dto.hashtagIds.length > 0) {
        const hashtags = await this.hashtagRepository.findBy({
          hashtagId: In(dto.hashtagIds),
        });

        if (hashtags.length !== dto.hashtagIds.length) {
          throw new BadRequestException('일부 해시태그를 찾을 수 없습니다.');
        }

        // 기존 Hashtag 연결 삭제
        await queryRunner.manager.delete(QuestItemUnitHashtag, {
          questId: id,
        });

        // 새 Hashtag 연결 생성
        const unitHashtags = dto.hashtagIds.map(hashtagId =>
          queryRunner.manager.create(QuestItemUnitHashtag, {
            questId: id,
            hashtag: { hashtagId },
            questItemUnit: existingUnit,
          }),
        );
        await queryRunner.manager.save(QuestItemUnitHashtag, unitHashtags);

        // type 필드 업데이트 (첫 번째 Hashtag의 code)
        // TODO unit.type 규칙 필요
        updateData.type = hashtags[0]?.code || existingUnit.type;
      }

      if (Object.keys(updateData).length > 0) {
        await queryRunner.manager.update(QuestItemUnit, id, updateData);
      }

      await queryRunner.commitTransaction();

      return this.questItemUnitRepository.findOneOrFail({
        where: { questItemUnitId: id },
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Unit 삭제 (연결된 QuestItem에서 사용 중이면 에러)
   */
  async deleteQuestItemUnit(id: number): Promise<void> {
    const unit = await this.questItemUnitRepository.findOne({
      where: { questItemUnitId: id },
    });

    if (!unit) {
      throw new NotFoundException(`Unit ID ${id}를 찾을 수 없습니다.`);
    }

    const usedInQuestItems = await this.questItemRepository
      .createQueryBuilder('qi')
      .where('qi.question1 = :unitId OR qi.question2 = :unitId OR qi.answer1 = :unitId OR qi.answer2 = :unitId', {
        unitId: id,
      })
      .getCount();

    if (usedInQuestItems > 0) {
      throw new BadRequestException(
        `이 Unit은 ${usedInQuestItems}개의 Quest Item에서 사용 중입니다. 삭제하려면 먼저 연결을 해제해주세요.`,
      );
    }

    await this.questItemUnitHashtagRepository.delete({ questId: id });

    await this.questItemUnitRepository.remove(unit);
  }

  /**
   * 특정 Unit이 사용된 Quest 목록 조회
   */
  async findQuestsByUnitId(unitId: number): Promise<Quest[]> {
    const questItems = await this.questItemRepository
      .createQueryBuilder('qi')
      .leftJoinAndSelect('qi.quest', 'quest')
      .where('qi.question1 = :unitId OR qi.question2 = :unitId OR qi.answer1 = :unitId OR qi.answer2 = :unitId', {
        unitId,
      })
      .getMany();

    const uniqueQuests = Array.from(
      new Map(questItems.map(item => [item.quest.questId, item.quest])).values(),
    );

    return uniqueQuests;
  }

  /**
   * Quest Item 생성 with validation
   */
  async createQuestItemWithValidation(dto: CreateQuestItemDto): Promise<QuestItem> {
    const quest = await this.questRepository.findOne({
      where: { questId: dto.questId },
    });
    if (!quest) {
      throw new NotFoundException(`Quest with ID ${dto.questId} not found`);
    }

    await this.validateQuestItemUnits(dto);

    this.validateQuestItemByType(dto);

    const questItem = this.questItemRepository.create({
      questId: dto.questId,
      type: dto.type,
      question1: dto.question1,
      question2: dto.question2 || null,
      answer1: dto.answer1 || null,
      answer2: dto.answer2 || null,
      answerOx: dto.answerOx || null,
      answerSq: dto.answerSq || null,
      remark: dto.remark || null,
      hasAnswer: true,
    });

    return this.questItemRepository.save(questItem);
  }

  /**
   * Quest Item 수정 with validation
   */
  async updateQuestItemWithValidation(questItemId: number, dto: UpdateQuestItemDto): Promise<QuestItem> {
    const questItem = await this.questItemRepository.findOne({
      where: { questItemId },
    });

    if (!questItem) {
      throw new NotFoundException(`Quest Item with ID ${questItemId} not found`);
    }

    if (dto.questId) {
      const quest = await this.questRepository.findOne({
        where: { questId: dto.questId },
      });
      if (!quest) {
        throw new NotFoundException(`Quest with ID ${dto.questId} not found`);
      }
    }

    await this.validateQuestItemUnits(dto);

    const finalType = dto.type || questItem.type;
    const mergedDto = { ...questItem, ...dto, type: finalType };
    this.validateQuestItemByType(mergedDto);

    if (dto.questId !== undefined) questItem.questId = dto.questId;
    if (dto.type !== undefined) questItem.type = dto.type;
    if (dto.question1 !== undefined) questItem.question1 = dto.question1;
    if (dto.question2 !== undefined) questItem.question2 = dto.question2;
    if (dto.answer1 !== undefined) questItem.answer1 = dto.answer1;
    if (dto.answer2 !== undefined) questItem.answer2 = dto.answer2;
    if (dto.answerOx !== undefined) questItem.answerOx = dto.answerOx;
    if (dto.answerSq !== undefined) questItem.answerSq = dto.answerSq;
    if (dto.remark !== undefined) questItem.remark = dto.remark;

    return this.questItemRepository.save(questItem);
  }

  /**
   * Quest Item 삭제 (UserQuestItem에서 사용 중이면 삭제 불가)
   */
  async deleteQuestItemWithCheck(questItemId: number): Promise<void> {
    const questItem = await this.questItemRepository.findOne({
      where: { questItemId },
    });

    if (!questItem) {
      throw new NotFoundException(`Quest Item with ID ${questItemId} not found`);
    }

    const usageCount = await this.userQuestItemRepository.count({
      where: { questItemId },
    });

    if (usageCount > 0) {
      throw new BadRequestException(
        `이 Quest Item은 ${usageCount}개의 User Quest Item에서 사용 중입니다. 삭제할 수 없습니다.`,
      );
    }

    await this.questItemRepository.remove(questItem);
  }

  /**
   * Unit 존재 여부 검증
   */
  private async validateQuestItemUnits(dto: Partial<CreateQuestItemDto | UpdateQuestItemDto>): Promise<void> {
    const unitIds: number[] = [];

    if (dto.question1) unitIds.push(dto.question1);
    if (dto.question2) unitIds.push(dto.question2);
    if (dto.answer1) unitIds.push(dto.answer1);
    if (dto.answer2) unitIds.push(dto.answer2);

    if (unitIds.length === 0) return;

    const units = await this.questItemUnitRepository.findBy({
      questItemUnitId: In(unitIds),
    });

    if (units.length !== unitIds.length) {
      const foundIds = units.map(u => u.questItemUnitId);
      const missingIds = unitIds.filter(id => !foundIds.includes(id));
      throw new NotFoundException(`Quest Item Units not found: ${missingIds.join(', ')}`);
    }
  }

  /**
   * Quest Item Type별 validation
   */
  private validateQuestItemByType(dto: any): void {
    switch (dto.type) {
      case 'choice':
        // choice: question1 필수, answer1/answer2 필수, 교집합 1개 필수
        if (!dto.question1) {
          throw new BadRequestException('choice 타입은 question1이 필수입니다.');
        }
        if (!dto.answer1 || !dto.answer2) {
          throw new BadRequestException('choice 타입은 answer1과 answer2가 모두 필수입니다.');
        }

        // 교집합 검증: question 중 하나가 answer에 포함되어야 함
        const questions = [dto.question1, dto.question2].filter(q => q != null);
        const answers = [dto.answer1, dto.answer2].filter(a => a != null);
        const intersection = questions.filter(q => answers.includes(q));

        if (intersection.length !== 1) {
          throw new BadRequestException(
            'choice 타입은 question과 answer의 교집합이 정확히 1개여야 합니다. (현재: ' + intersection.length + '개)',
          );
        }
        break;

      case 'same-different':
        // same-different: question1/question2 필수, answerOx 필수
        if (!dto.question1 || !dto.question2) {
          throw new BadRequestException('same-different 타입은 question1과 question2가 모두 필수입니다.');
        }
        if (!dto.answerOx) {
          throw new BadRequestException('same-different 타입은 answerOx가 필수입니다.');
        }
        break;

      case 'statement-question':
        // statement-question: question1 필수, answerSq 필수
        if (!dto.question1) {
          throw new BadRequestException('statement-question 타입은 question1이 필수입니다.');
        }
        if (!dto.answerSq) {
          throw new BadRequestException('statement-question 타입은 answerSq가 필수입니다.');
        }
        break;

      default:
        throw new BadRequestException(`Invalid quest item type: ${dto.type}`);
    }
  }
}
