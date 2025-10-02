import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quest } from './entities/quest.entity';
import { QuestItem } from './entities/quest-item.entity';
import { QuestItemUnit } from './entities/quest-item-unit.entity';
import { 
  SentenceTestResponseDto, 
  SentenceQuestionResponseDto, 
  CheckAnswerRequestDto, 
  CheckAnswerResponseDto,
  AddToWrongNotesRequestDto 
} from './dto/sentence-test.dto';

@Injectable()
export class QuestService {
  constructor(
    @InjectRepository(Quest)
    private questRepository: Repository<Quest>,
    @InjectRepository(QuestItem)
    private questItemRepository: Repository<QuestItem>,
    @InjectRepository(QuestItemUnit)
    private questItemUnitRepository: Repository<QuestItemUnit>,
  ) {}

  // Quest 관련 메서드
  async findAllQuests(): Promise<Quest[]> {
    return this.questRepository.find({
      relations: ['questItems', 'course'],
    });
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
      where: { questItemId },
    });
  }

  async createQuestItemUnit(questItemUnitData: Partial<QuestItemUnit>): Promise<QuestItemUnit> {
    const questItemUnit = this.questItemUnitRepository.create(questItemUnitData);
    return this.questItemUnitRepository.save(questItemUnit);
  }

  // 문장 검사 관련 메서드
  async getSentenceTest(questId: number): Promise<SentenceTestResponseDto> {
    const quest = await this.questRepository.findOneOrFail({
      where: { questId },
      relations: ['course'],
    });

    // QuestItems를 별도로 조회
    const questItems = await this.questItemRepository.find({
      where: { questId },
    });

    console.log('Quest found:', quest);
    console.log('Quest items count:', questItems.length);

    const questions: SentenceQuestionResponseDto[] = [];
    
    for (const questItem of questItems) {
      console.log('Processing quest item:', questItem.questItemId);
      
      // question1에서 음원 찾기
      const audioUnit = await this.questItemUnitRepository.findOne({
        where: { questItemUnitId: questItem.question1 },
      });

      console.log('Audio unit found:', !!audioUnit);

      // answer1, answer2, answer3에서 선택지 찾기
      const optionUnits = await this.questItemUnitRepository.find({
        where: [
          { questItemUnitId: questItem.answer1 },
          { questItemUnitId: questItem.answer2 },
          { questItemUnitId: questItem.answer3 },
        ],
      });

      console.log('Option units found:', optionUnits.length);

      // 정답 찾기 (answer1이 정답이라고 가정)
      const correctAnswerUnit = optionUnits.find(unit => unit.questItemUnitId === questItem.answer1);

      console.log('Correct answer unit found:', !!correctAnswerUnit);

      if (audioUnit && correctAnswerUnit) {
        const question = {
          questItemId: questItem.questItemId,
          questionOrder: questItem.questItemId,
          audioUrl: audioUnit.urlNormal || '',
          slowAudioUrl: audioUnit.urlSlow,
          correctAnswerUnitId: correctAnswerUnit.questItemUnitId,
          correctAnswerText: correctAnswerUnit.str || '',
          options: optionUnits.map(unit => ({
            questItemUnitId: unit.questItemUnitId,
            text: unit.str || '',
          })),
          explanation: questItem.remark,
        };
        
        console.log('Adding question:', question.questItemId);
        questions.push(question);
      } else {
        console.log('Skipping quest item - missing audio or correct answer unit');
        console.log('Audio unit:', audioUnit);
        console.log('Correct answer unit:', correctAnswerUnit);
      }
    }

    console.log('Final questions count:', questions.length);

    return {
      questId: quest.questId,
      title: quest.course?.title || '문장 검사',
      description: quest.course?.objective,
      totalQuestions: quest.questItemCount,
      questions,
    };
  }

  async checkSentenceAnswer(checkAnswerDto: CheckAnswerRequestDto): Promise<CheckAnswerResponseDto> {
    const questItem = await this.questItemRepository.findOneOrFail({
      where: { questItemId: checkAnswerDto.questItemId },
    });

    // answer1이 정답이라고 가정
    const isCorrect = questItem.answer1 === checkAnswerDto.userAnswerUnitId;
    
    // 정답 정보 가져오기
    const correctAnswerUnit = await this.questItemUnitRepository.findOneOrFail({
      where: { questItemUnitId: questItem.answer1 },
    });

    return {
      isCorrect,
      correctAnswerUnitId: correctAnswerUnit.questItemUnitId,
      correctAnswerText: correctAnswerUnit.str || '',
      explanation: questItem.remark,
    };
  }

  async addToWrongNotes(addToWrongNotesDto: AddToWrongNotesRequestDto): Promise<void> {
    // user_quest_items 테이블에 오답 기록 저장
    // 실제 구현에서는 UserQuestItem 엔티티를 사용해야 함
    console.log('오답 노트 추가:', addToWrongNotesDto);
    // TODO: UserQuestItem 엔티티 생성 후 구현
  }
}
