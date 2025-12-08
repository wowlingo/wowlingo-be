import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, PrimaryGeneratedColumn, Repository } from 'typeorm';
import { UserQuestItem } from './entities/user-quest-item.entity';
import { UserQuestItemDto } from './dto/user-quest-item.dto';
import { Quest } from '../quest/entities/quest.entity';
import { QuestItem } from '../quest/entities/quest-item.entity';
import { UserQuest } from './entities/user-quest.entity';
import { UserQuestStatusDto, UserQuestListResponseDto } from './dto/user-quest-status.dto';
import { UserQuestProgress } from './entities/user-quest-progress.entity';
import { QuestItemUnit } from '../quest/entities/quest-item-unit.entity';
import { ReviewQuestItemDto } from './dto/review-quest-item.dto';
import { HashtagService } from '../hashtag/hashtag.service';
import { FruitType } from './fruit.enum';
import { UserQuestAttempt } from '../user/entities/user-quest-attempt.entity';

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
        @InjectRepository(UserQuestAttempt)
        private userQuestAttemptRepository: Repository<UserQuestAttempt>,
        private hashtagService: HashtagService,
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
        let currentFruit: FruitType = FruitType.Apple;
        let currentFruitLevel: number = 1;
        let nextLevelCount: number = 0;

        // 5. 퀘스트별 해시태그
        const questIds = allQuests.flatMap(it => it.questId).filter((id): id is number => id !== null);
        const hashtagMap = await this.hashtagService.getHashtagMapByQuests(questIds);

        for (const quest of allQuests) {
            const progress = progressMap.get(quest.questId);

            // progress가 없으면 아직 시작 안 한 상태
            const correctCount = progress?.correctCount || 0;
            const totalCount = progress?.totalTargetCount || 70;
            const isCompleted = progress?.doneYn || false;
            const isStarted = progress ? true : false;

            // 진행률 계산 (totalCount 기준)
            const currentRate = (correctCount / totalCount) * 100;
            let progressRate = Math.min(totalCount > 0 ?
                Math.round(currentRate) : 0, 100); // 진행률 최대 100

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
            // const tags = this.generateQuestTags(quest.type);
            const tags = hashtagMap.get(quest.questId) || [];

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
            // TODO:: 다음 문제를 풀기 시작해야만, 
            if (previousQuestCompleted && !isCompleted && activeQuestId === null) {
                activeQuestId = quest.questId;

                // 열매 정보 생성.
                currentFruit = progress?.fruit ?? FruitType.Apple;
                // 10문제 맞추면 다음 레벨로 넘어감.
                // '소리의 씨앗(Lv1)' 에서 10문제 맞추면 -> '소리의 새싹(Lv2)'
                // progressRate < 20% => 레벨 1
                // progressRate < 40% => 레벨 2
                // progressRate < 60% => 레벨 3
                // progressRate < 80% => 레벨 4
                // progressRate <= 100% => 레벨 5
                // currentFruitLevel = Math.floor(correctCount / 10) + 1;
                // nextLevelCount = (currentFruitLevel * 10) - correctCount;

                // 현재 퀘스트 내에서의 레벨.
                let localLevel = Math.floor(currentRate / 20) + 1;
                if (localLevel > 5) localLevel = 5;

                // 이전 퀘스트들의 만렙(5) 누적 계산
                // const baseLevel = (activeQuestId - 1) * 5;
                // currentFruitLevel = baseLevel + localLevel;
                // 다시 레벨 초기화가 맞습니다.
                currentFruitLevel = localLevel;

                if (currentRate >= 100) nextLevelCount = 0;
                else {
                    const nextTargetPercent = localLevel * 20; // 다음 레벨.
                    const targetCorrectCount = Math.ceil(totalCount * (nextTargetPercent / 100));
                    nextLevelCount = Math.max(targetCorrectCount - correctCount, 0); // 0보다 작은건 없음.
                }


            }

            // 다음 퀘스트를 위해 현재 퀘스트의 완료 상태 저장
            previousQuestCompleted = isCompleted;
        }

        return {
            quests: questStatusList,
            activeQuestId,
            fruit: currentFruit,
            fruitLevel: currentFruitLevel,
            nextLevelCount
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

        // 4. user_quest_attempts 업데이트 (학습 완료 시 attemptDate 설정)
        await this.updateUserQuestAttempt(userId);

        // 5. choice 타입의 경우 userAnswerText 추가
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

        // 6. userQuest에 enrichedItems 추가해서 반환
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

    async getQuestItemsByCorrectYnAndStartedAt(userId: number, correctYn: boolean, date: Date): Promise<QuestItem[]> {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        return this.questItemRepository.createQueryBuilder('qi')
            .innerJoin('user_quest_items', 'uqi', 'uqi.quest_item_id = qi.quest_item_id')
            .innerJoin('user_quests', 'uq', 'uq.user_quest_id = uqi.user_quest_id')
            .where('uq.userId = :userId', { userId })
            .andWhere('uqi.correctYn = :correctYn', { correctYn })
            .andWhere('uqi.started_at BETWEEN :startDate AND :endDate', { startDate, endDate })
            .getMany();
    }

    async getQuestItemUnitsByCorrectYnAndAttemptAtAndHashtags(userId: number, correctYn: boolean, date: Date, hashtagIds: number[], question: 'question1' | 'question2') {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        let query = this.questItemUnitRepository
            .createQueryBuilder('qiu')
            .distinct(true)
            .select('qiu.*')
            .addSelect(['qi.quest_item_id', 'q.quest_id', 'q.title AS quest_title'])
            .innerJoin('quest_items', 'qi', 'qiu.quest_item_unit_id IN (qi.' + question + ')')
            .innerJoin('quests', 'q', 'qi.quest_id = q.quest_id')
            .leftJoin('quest_item_unit_hashtags', 'qiuh', 'qiuh.quest_item_unit_id IN(qi.' + question + ')')
            .innerJoin('user_quest_items', 'uqi', 'uqi.quest_item_id = qi.quest_item_id')
            .innerJoin('user_quests', 'uq', 'uq.user_quest_id = uqi.user_quest_id')
            .where('uq.userId = :userId', { userId })
            .andWhere('uqi.correctYn = :correctYn', { correctYn })
            .andWhere('uqi.started_at BETWEEN :startDate AND :endDate', { startDate, endDate })

        if (hashtagIds && hashtagIds.length > 0)
            query.andWhere('qiuh.hashtag_id IN (:...hashtagIds)', { hashtagIds });

        console.log(query.getSql());
        console.log(query.getParameters());

        return query.getRawMany();
    }

    async getQuestItemUnitsByQuestItemIds(questItemIds: number[], question: 'question1' | 'question2') {
        let query = this.questItemUnitRepository
            .createQueryBuilder('qiu')
            .distinct(true)
            .select('qiu.*')
            .addSelect(['qi.quest_item_id', 'q.quest_id', 'q.title AS quest_title'])
            .innerJoin('quest_items', 'qi', 'qiu.quest_item_unit_id IN (qi.' + question + ')')
            .innerJoin('quests', 'q', 'qi.quest_id = q.quest_id')
            .where('qi.quest_item_id IN (:...questItemIds)', { questItemIds });

        console.log(query.getSql());
        console.log(query.getParameters());

        return query.getRawMany();
    }

    async getQuestItemsByCorrectYnAndAttemptAtAndHashtags(userId: number, correctYn: boolean, date: Date, hashtagIds: number[]) {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        let query = this.questItemRepository
            .createQueryBuilder('qi')
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
                fruit: makeRandomFruit(questId) // 랜덤 과일 가져오기.
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

    async makeReviewQuestItemDto(reviewQuestItems: any[]): Promise<ReviewQuestItemDto[]> {
        const dtoList: ReviewQuestItemDto[] = Object.values(
            reviewQuestItems.reduce((acc, row) => {
                const id = row.quest_item_id;
                if (!acc[id]) {
                    acc[id] = {
                        questId: row.quest_id,
                        title: row.quest_title,
                        type: row.type,
                        questItemId: row.quest_item_id,
                        sounds: [],
                        units: [],
                    };
                }

                // sounds 배열 추가
                if (row.url_normal) {
                    acc[id].sounds.push({
                        url: row.url_normal,
                        type: 'normal'
                    });
                }
                if (row.url_slow) {
                    acc[id].sounds.push({
                        url: row.url_slow,
                        type: 'slow'
                    });
                }


                // units 배열 추가
                acc[id].units.push(row.str);

                return acc;
            }, {} as Record<number, ReviewQuestItemDto>)
        );

        return dtoList;
    }

    private async updateUserQuestAttempt(userId: number): Promise<void> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const attempt = await this.userQuestAttemptRepository.findOne({
            where: {
                userId,
                loginDate: Between(today, tomorrow)
            }
        });

        // 레코드가 있고 attemptDate가 NULL인 경우만 업데이트 (첫 학습 완료 시간 유지)
        if (attempt && !attempt.attemptDate) {
            attempt.attemptDate = new Date();
            await this.userQuestAttemptRepository.save(attempt);
        }
        // 레코드가 없으면 새로 생성 (loginDate + attemptDate 동시 설정)
        else if (!attempt) {
            const newAttempt = this.userQuestAttemptRepository.create({
                userId,
                loginDate: new Date(),
                attemptDate: new Date()
            });
            await this.userQuestAttemptRepository.save(newAttempt);
        }
        // 레코드가 있고 attemptDate도 이미 있으면 아무것도 안함 (첫 학습 시간 유지)
    }
}

function makeRandomFruit(questId: number): FruitType {
    const numberArray: number[] = [
        1, 2, 3, 4, 5, 2, 4, 5, 1, 3, 4, 3, 2, 1, 5, 1, 3, 5, 2, 4, 3, 1, 4, 5, 2, 5, 2, 1, 3, 4, 2, 3, 5, 4, 1, 4, 5, 2, 3, 1, 5, 4, 2, 1, 3, 1, 2, 3, 5, 4, 3, 5, 4, 1, 2, 4, 3, 2, 1, 5, 3, 2, 5, 4, 1,
        2, 4, 5, 3, 1, 2, 1, 4, 3, 5, 2, 1, 4, 5, 3, 1, 3, 2, 5, 4, 2, 4, 1, 3, 5, 4, 3, 1, 5, 2,
        3, 4, 2, 1, 5, 1, 2, 4, 5, 3, 1, 5, 4, 2, 3, 1, 2, 3, 4, 5, 2, 3, 4, 1, 5, 4, 1, 2, 5, 3,
        2, 4, 1, 5, 3, 4, 5, 1, 3, 2, 4, 3, 1, 2, 5, 3, 5, 4, 1, 2, 3, 2, 5, 1, 4, 2, 4, 5, 1, 3,
        1, 4, 2, 5, 3, 2, 4, 5, 1, 3, 2, 1, 5, 3, 4, 5, 3, 4, 2, 1, 3, 1, 2, 5, 4, 1, 5, 4, 3, 2,
        5, 3, 4, 2, 1, 4, 2, 5, 3, 1, 3, 4, 2, 5, 1, 4, 3, 2, 5, 1, 4, 2, 1, 5, 3, 5, 4, 1, 3, 2,
        4, 5, 1, 3, 2, 3, 2, 5, 4, 1, 3, 2, 1, 4, 5, 1, 2, 5, 3, 4, 3, 4, 5, 1, 2, 3, 2, 5, 1, 4,
        3, 1, 4, 5, 2, 5
    ];

    let index = questId - 1;
    if (index < 0 && index >= numberArray.length) {
        index = Math.floor(Math.random() * 5) + 1;
    }

    const arrayValue: number = numberArray[index]; // 1, 2, 3, 4, 5 중 하나

    switch (arrayValue) {
        case 1:
            return FruitType.Apple;
        case 2:
            return FruitType.Strawberry;
        case 3:
            return FruitType.Peach;
        case 4:
            return FruitType.Cherry;
        case 5:
            return FruitType.Blueberry;
        default:
            return FruitType.Apple;
    }
}
