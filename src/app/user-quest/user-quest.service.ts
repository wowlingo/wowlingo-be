import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, PrimaryGeneratedColumn, Repository } from 'typeorm';
import { UserQuestItem } from './entities/user-quest-item.entity';
import { UserQuestItemDto } from './dto/user-quest-item.dto';
import { Quest } from '../quest/entities/quest.entity'
import { QuestItem } from '../quest/entities/quest-item.entity'
import { UserQuest } from './entities/user-quest.entity'
import { UserQuestStatusDto, UserQuestListResponseDto } from './dto/user-quest-status.dto'
import { UserQuestProgress } from './entities/user-quest-progress.entity'
import { QuestItemUnit } from '../quest/entities/quest-item-unit.entity'

@Injectable()
export class UserQuestService {
    constructor(
        @InjectRepository(UserQuest)
        private userQuestRepository: Repository<UserQuest>,
        @InjectRepository(UserQuestItem)
        private userQuestItemRepository: Repository<UserQuestItem>,
        @InjectRepository(QuestItem)
        private questItemRepository: Repository<QuestItem>,
        @InjectRepository(Quest)
        private questRepository: Repository<Quest>,
        @InjectRepository(UserQuestProgress)
        private userQuestProgressRepository: Repository<UserQuestProgress>,
        @InjectRepository(QuestItemUnit)
        private questItemUnitRepository: Repository<QuestItemUnit>,
    ) { }

    async getUserQuestStatusList(userId: number): Promise<UserQuestListResponseDto> {
        // 1. 모든 퀘스트 조회 (order 순으로)
        const allQuests = await this.questRepository.find({
            order: { order: 'ASC' }
        });

        // 2. 사용자의 퀘스트 진행 상태 조회 (user_quest_progress 기반)
        const userQuestProgresses = await this.userQuestProgressRepository.find({
            where: { userId }
        });

        // 3. user_quest_progress를 Map으로 변환
        const progressMap = new Map<number, UserQuestProgress>();
        userQuestProgresses.forEach(progress => {
            progressMap.set(progress.questId, progress);
        });

        // 4. 각 퀘스트별 상태 계산
        const questStatusList: UserQuestStatusDto[] = [];
        let activeQuestId: number | null = null;
        let previousQuestCompleted = true; // 첫 번째 퀘스트는 항상 열려있음

        for (const quest of allQuests) {
            const progress = progressMap.get(quest.questId);

            // progress가 없으면 아직 시작 안 한 상태
            const correctCount = progress?.correctCount || 0;
            const totalCount = progress?.totalTargetCount || 70;
            const isCompleted = progress?.doneYn || false;
            const isStarted = progress ? true : false;

            // 진행률 계산 (totalCount 기준)
            const progressRate = totalCount > 0 ?
                Math.round((correctCount / totalCount) * 100) : 0;

            // 정확도는 가장 최근 user_quest에서 가져오기
            let accuracyRate = 0;
            const latestUserQuest = await this.userQuestRepository.findOne({
                where: { userId, questId: quest.questId },
                order: { userQuestId: 'DESC' }
            });
            if (latestUserQuest) {
                accuracyRate = Number(latestUserQuest.accuracyRate);
            }

            // 태그 생성
            const tags = this.generateQuestTags(quest.type);

            const questStatus: UserQuestStatusDto = {
                questId: quest.questId,
                title: quest.title,
                type: quest.type,
                order: quest.order,
                tags,
                correctCount,
                totalCount,
                isCompleted,
                isStarted,
                accuracyRate,
                progressRate
            };

            questStatusList.push(questStatus);

            // 활성 퀘스트 결정: 이전 퀘스트가 완료되고, 현재 퀘스트가 미완료인 첫 번째 퀘스트
            if (previousQuestCompleted && !isCompleted && activeQuestId === null) {
                activeQuestId = quest.questId;
            }

            // 다음 퀘스트를 위해 현재 퀘스트의 완료 상태 저장
            previousQuestCompleted = isCompleted;
        }

        return {
            quests: questStatusList,
            activeQuestId
        };
    }

    private generateQuestTags(questType: string): string[] {
        // 퀘스트 타입에 따른 태그 생성 로직
        const tagMap: { [key: string]: string[] } = {
            'sound_detection': ['#환경음', '#말소리'],
            'intonation': ['#낱말 검사'],
            'word_length': ['#낱말 검사'],
            'sentence_length': ['#낱말 검사'],
            'statement-question': ['#평서문/의문문'],
            'same-different': ['#같은/다른'],
            'choice': ['#선택'],
            // 다른 타입들도 추가 가능
        };

        return tagMap[questType] || ['#기본'];
    }

    async submitQuestResult(
        userId: number,
        questId: number,
        items: Partial<UserQuestItemDto>[],
        startedAt: Date,
        endedAt: Date,
        timeSpent: number,
        totalQuestItemCount: number,
        correctQuestItemCount: number,
        accuracyRate: number
    ): Promise<{ userQuest: UserQuest & { userQuestItems: any[] } }> {
        // 1. 항상 새로운 UserQuest 생성
        const userQuest = await this.createNewUserQuest(userId, questId, startedAt, endedAt, timeSpent, totalQuestItemCount, correctQuestItemCount, accuracyRate);
        
        // 2. 모든 아이템 결과 저장
        const savedItems: UserQuestItem[] = [];
        
        for (const itemData of items) {

            if (!itemData?.questItemId) {
                continue;
            }

            // 사용자 답변 저장
            const savedItem = await this.processUserAnswer(userQuest, itemData);
            savedItems.push(savedItem);
        }

        // 3. user_quest_progress 업데이트 (누적 맞힌 문제 수 계산)
        await this.updateUserQuestProgress(userId, questId);

        // 4. choice 타입의 경우 userAnswerText 추가
        const enrichedItems = await Promise.all(
            savedItems.map(async (item) => {
                try {
                    // questItem 조회
                    const questItem = await this.questItemRepository.findOne({
                        where: { questItemId: item.questItemId }
                    });

                    let userAnswerText: string | undefined = undefined;

                    // choice 타입이고 userAnswer가 있으면 questItemUnit 조회
                    if (questItem?.type === 'choice' && item.userAnswer) {
                        const unitId = Number(item.userAnswer);
                        if (!isNaN(unitId)) {
                            const unit = await this.questItemUnitRepository.findOne({
                                where: { questItemUnitId: unitId }
                            });
                            userAnswerText = unit?.str;
                        }
                    }

                    return {
                        ...item,
                        userAnswerText
                    } as any;
                } catch (error) {
                    throw error;
                }
            })
        );

        // 5. userQuest에 enrichedItems 추가해서 반환
        return {
            userQuest: {
                ...userQuest,
                userQuestItems: enrichedItems
            },
        };
    }

    private async createNewUserQuest(
        userId: number, 
        questId: number, 
        startedAt: Date,
        endedAt: Date,
        timeSpent: number,
        totalQuestItemCount: number,
        correctQuestItemCount: number,
        accuracyRate: number
    ): Promise<UserQuest> {
        // 퀘스트 존재 확인
        const quest = await this.questRepository.findOneBy({ questId: Number(questId) });
        if (!quest) {
            throw new NotFoundException('퀘스트를 찾을 수 없습니다.');
        }

        // 항상 새로운 UserQuest 생성
        const newUserQuest = this.userQuestRepository.create({
            userId,
            questId: Number(questId),
            startedAt,
            endedAt,
            timeSpent,
            totalQuestItemCount,
            correctQuestItemCount,
            accuracyRate,
        });

        return await this.userQuestRepository.save(newUserQuest);
    }

    // 소요시간 계산.
    private calculateTimeSpent(startAt?: Date, endAt?: Date): number {
        if (endAt instanceof Date) {
            const effectiveStartAt = startAt ?? new Date();
            const timeDifferenceInMs = endAt?.getTime() - effectiveStartAt.getTime();
            return timeDifferenceInMs / 1000;
        }
        return 0;
    }

    async getQuestItemsByCorrectYnAndAttemptAt(userId: number, correctYn: boolean, date: Date): Promise<QuestItem[]> {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        return this.questItemRepository.createQueryBuilder('qi')
            .innerJoin('user_quest_items', 'uqi', 'uqi.quest_item_id = qi.quest_item_id')
            .innerJoin('user_quests', 'uq', 'uq.user_quest_id = uqi.user_quest_id')
            .where('uq.userId = :userId', { userId })
            .andWhere('uqi.correctYn = :correctYn', { correctYn })
            .andWhere('uqi.attempt_at BETWEEN :startDate AND :endDate', { startDate, endDate })
            .getMany();
    }

    async getQuestItemUnitsByCorrectYnAndAttemptAtAndHashtags(userId: number, correctYn: boolean, date: Date, hashtagIds: number[]) {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        let query = this.questItemUnitRepository
            .createQueryBuilder('qiu')
            .distinct(true)
            .innerJoin('quest_items', 'qi', 'qiu.quest_item_unit_id IN (qi.question1, qi.question2)')
            .leftJoin('quest_item_unit_hashtags', 'qiuh', 'qiuh.quest_item_unit_id IN(qi.question1, qi.question2)')
            .innerJoin('user_quest_items', 'uqi', 'uqi.quest_item_id = qi.quest_item_id')
            .innerJoin('user_quests', 'uq', 'uq.user_quest_id = uqi.user_quest_id')
            .where('uq.userId = :userId', { userId })
            .andWhere('uqi.correctYn = :correctYn', { correctYn })
            .andWhere('uqi.started_at BETWEEN :startDate AND :endDate', { startDate, endDate })

        if (hashtagIds && hashtagIds.length > 0)
            query.andWhere('qiuh.hashtag_id IN (:...hashtagIds)', { hashtagIds });

        console.log(query.getSql());
        console.log(query.getParameters());

        return query.getMany();
    }

    private async processUserAnswer(
        userQuest: UserQuest,
        itemData: Partial<UserQuestItemDto>
    ): Promise<UserQuestItem> {

        // 이전 attempt_count 조회 (누적)
        const previousAttempts = await this.userQuestItemRepository
            .createQueryBuilder('uqi')
            .innerJoin('user_quests', 'uq', 'uq.user_quest_id = uqi.user_quest_id')
            .where('uq.user_id = :userId', { userId: userQuest.userId })
            .andWhere('uq.quest_id = :questId', { questId: userQuest.questId })
            .andWhere('uqi.quest_item_id = :questItemId', { questItemId: itemData.questItemId })
            .select('MAX(uqi.attempt_count)', 'maxAttempt')
            .getRawOne();

        const attemptCount = previousAttempts?.maxAttempt ? previousAttempts.maxAttempt + 1 : 1;

        // 문제 정보 조회하여 정답 검증
        const questItem = await this.questItemRepository.findOne({
            where: {
                questId: userQuest.questId,
                questItemId: itemData.questItemId
            }
        });

        if (!questItem) {
            throw new NotFoundException(`Quest item ${itemData.questItemId} not found`);
        }

        // 서버에서 정답 검증
        const correctYn = this.validateAnswer(questItem, itemData.userAnswer || '');

        // 항상 새로운 UserQuestItem 생성 (userQuest가 매번 새로 생성되므로)
        const newUserQuestItem = this.userQuestItemRepository.create({
            userQuestId: userQuest.userQuestId,
            questItemId: itemData.questItemId,
            userAnswer: itemData.userAnswer,
            correctYn: correctYn,
            timeSpent: itemData.timeSpent,
            attemptCount: attemptCount,
            startedAt: itemData.startedAt || new Date(),
            endedAt: itemData.endedAt || new Date(),
        });

        const savedItem = await this.userQuestItemRepository.save(newUserQuestItem);
        return savedItem;
    }

    private validateAnswer(questItem: QuestItem, userAnswer: string): boolean {
        console.log('=== validateAnswer ===');
        console.log('questItemId:', questItem.questItemId);
        console.log('questItem.type:', questItem.type);
        console.log('userAnswer:', userAnswer, 'type:', typeof userAnswer);

        if (!userAnswer) {
            console.log('userAnswer is empty, returning false');
            return false;
        }

        // type 필드를 기준으로 검증 (answerSq, answerOx는 다른 용도로 사용될 수 있음)
        if (questItem.type === 'statement-question') {
            // statement-question 타입: answer_sq와 비교
            const result = userAnswer.toLowerCase() === (questItem.answerSq?.toLowerCase() || '');
            console.log('statement-question type, answerSq:', questItem.answerSq, 'result:', result);
            return result;
        }

        if (questItem.type === 'same-different') {
            // same-different 타입: answer_ox와 비교
            const result = userAnswer.toLowerCase() === (questItem.answerOx?.toLowerCase() || '');
            console.log('same-different type, answerOx:', questItem.answerOx, 'result:', result);
            return result;
        }

        if (questItem.type === 'choice') {
            // choice 타입: question과 answer 중 일치하는 것이 정답
            const userAnswerId = Number(userAnswer);
            console.log('choice type, userAnswerId:', userAnswerId);

            if (isNaN(userAnswerId)) {
                console.log('userAnswerId is NaN, returning false');
                return false;
            }

            // question1, question2와 answer1, answer2 비교 (bigint는 Number로 변환)
            console.log('questItem.question1:', questItem.question1, 'type:', typeof questItem.question1);
            console.log('questItem.question2:', questItem.question2, 'type:', typeof questItem.question2);
            console.log('questItem.answer1:', questItem.answer1, 'type:', typeof questItem.answer1);
            console.log('questItem.answer2:', questItem.answer2, 'type:', typeof questItem.answer2);

            const questions = [questItem.question1, questItem.question2]
                .filter(q => q !== null)
                .map(q => Number(q));
            const answers = [questItem.answer1, questItem.answer2]
                .filter(a => a !== null && a !== -1)
                .map(a => Number(a));

            console.log('questions:', questions);
            console.log('answers:', answers);

            // 정답: question과 answer에 모두 포함된 ID
            const correctAnswerId = questions.find(q => answers.includes(q));
            console.log('correctAnswerId:', correctAnswerId);

            const result = userAnswerId === correctAnswerId;
            console.log('validation result:', result);
            console.log('======================');

            return result;
        }

        console.log('Unknown type:', questItem.type);
        console.log('======================');
        return false;
    }

    private async updateUserQuestProgress(userId: number, questId: number): Promise<void> {
        // 기존 user_quest_progress 조회 또는 생성
        let progress = await this.userQuestProgressRepository.findOne({
            where: { userId, questId }
        });

        if (!progress) {
            progress = this.userQuestProgressRepository.create({
                userId,
                questId,
                totalTargetCount: 70,
                passThreshold: 50,
                correctCount: 0,
                doneYn: false,
            });
        }

        // 이 quest에서 누적으로 맞힌 문제들의 ID를 조회 (중복 제거)
        const correctItemIds = await this.userQuestItemRepository
            .createQueryBuilder('uqi')
            .innerJoin('user_quests', 'uq', 'uq.user_quest_id = uqi.user_quest_id')
            .where('uq.user_id = :userId', { userId })
            .andWhere('uq.quest_id = :questId', { questId })
            .andWhere('uqi.correct_yn = :correctYn', { correctYn: true })
            .select('DISTINCT uqi.quest_item_id', 'questItemId')
            .getRawMany();

        // 누적 맞힌 문제 수 (unique)
        const correctCount = correctItemIds.length;

        // done_yn 업데이트 (50개 이상 맞혔는지)
        const doneYn = correctCount >= progress.passThreshold;

        // progress 업데이트
        progress.correctCount = correctCount;
        progress.doneYn = doneYn;
        progress.lastPlayedAt = new Date();

        await this.userQuestProgressRepository.save(progress);
    }
}