import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserQuestItem } from './entities/user-quest-item.entity';
import { UserQuestItemDto } from './dto/user-quest-item.dto';
import { Quest } from '../quest/entities/quest.entity'
import { QuestItem } from '../quest/entities/quest-item.entity'
import { QuestItemUnit } from '../quest/entities/quest-item-unit.entity'
import { User } from '../user/entities/user.entity'
import { UserQuest } from './entities/user-quest.entity'
import { min } from 'class-validator';
import it from 'node:test';
import { UserQuestStatusDto, UserQuestListResponseDto } from './dto/user-quest-status.dto'

@Injectable()
export class UserQuestService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(UserQuest)
        private userQuestRepository: Repository<UserQuest>,
        @InjectRepository(UserQuestItem)
        private userQuestItemRepository: Repository<UserQuestItem>,
        @InjectRepository(QuestItem)
        private questItemRepository: Repository<QuestItem>,
        @InjectRepository(Quest)
        private questRepository: Repository<Quest>,
        @InjectRepository(QuestItemUnit)
        private questItemUnitRepository: Repository<QuestItemUnit>,
    ) { }

    async createUserQuestItem(
        userId: number,
        questId: number,
        itemData: Partial<UserQuestItemDto>
    ): Promise<UserQuestItem | null> {
        if (!itemData?.questItemId) {
            return null;
        }

        // 1. 문제아이템 조회
        const questItem = await this.questItemRepository.findOneBy({
            questId,
            questItemId: itemData.questItemId,
        });

        if (!questItem) {
            console.log('아이템을 찾을 수 없습니다.');
            return null;
        }

        // 2. 사용자 퀘스트 조회 및 생성
        const userQuest = await this.findOrCreateUserQuest(userId, questId);

        // 3. 사용자 답변 저장
        const savedUserQuestItem = await this.processUserAnswer(userQuest, itemData, questItem);

        // 4. 문제집 완료 확인 및 업데이트
        await this.checkAndFinalizeQuest(userQuest);

        return savedUserQuestItem;
    }

    async getUserQuest(
        userId: number, questId: number
    ): Promise<UserQuest | null> {
        const userQuest = await this.userQuestRepository.findOne({
            relations: {
                userQuestItems: false,
            },
            where: {
                questId: questId,
                userId: userId,
            },
        });

        if (!userQuest) {
            console.log('사용자 학습 문제를 찾을 수 없습니다.');
            return null;
        }

        return userQuest;
    }

    async getUserQuests(userId: number): Promise<UserQuest[]> {
        const userQuests = await this.userQuestRepository.find({
            where: {
                userId: userId,
            },
            order: {
                startedAt: 'DESC',
            },
        });

        return userQuests;
    }

    async getUserQuestStatusList(userId: number): Promise<UserQuestListResponseDto> {
        // 1. 모든 퀘스트 조회 (사용자 진행 상태와 관계없이)
        const allQuests = await this.questRepository.find({
            order: { order: 'ASC' }
        });

        // 2. 사용자의 퀘스트 진행 상태 조회
        const userQuests = await this.userQuestRepository.find({
            where: { userId },
            relations: ['userQuestItems']
        });

        console.log(`Found ${userQuests.length} userQuests for userId=${userId}:`, 
            userQuests.map(uq => ({ questId: uq.questId, userQuestId: uq.userQuestId, doneYn: uq.doneYn })));

        // 3. 사용자 퀘스트를 Map으로 변환하여 빠른 조회 가능하게 함 (문자열과 숫자 모두 지원)
        const userQuestMap = new Map();
        userQuests.forEach(uq => {
            userQuestMap.set(uq.questId, uq);
            userQuestMap.set(String(uq.questId), uq);  // 문자열 키도 추가
            userQuestMap.set(Number(uq.questId), uq);  // 숫자 키도 추가
        });

        // 4. 각 퀘스트별 상태 계산
        const questStatusList: UserQuestStatusDto[] = [];
        let activeQuestId: number | null = null;

        for (const quest of allQuests) {
            const userQuest = userQuestMap.get(quest.questId);
            
            console.log(`Processing quest ${quest.questId} (${typeof quest.questId}):`, 
                userQuest ? `Found userQuest (userQuestId: ${userQuest.userQuestId}, doneYn: ${userQuest.doneYn})` : 'No userQuest found');
            
            let correctCount = 0;
            let isStarted = false;
            let isCompleted = false;
            let accuracyRate = 0;

            if (userQuest) {
                isStarted = true;
                isCompleted = userQuest.doneYn;
                accuracyRate = userQuest.accuracyRate;
                
                // 맞힌 문제 수 계산 (UserQuestItem에서 correctYn: true인 것만)
                correctCount = await this.userQuestItemRepository.count({
                    where: { 
                        userQuestId: userQuest.userQuestId,
                        correctYn: true
                    }
                });
                
                console.log(`Quest ${quest.questId}: correctCount=${correctCount}, isCompleted=${isCompleted}, accuracyRate=${accuracyRate}`);
            }

            // 진행률 계산
            const progressRate = quest.questItemCount > 0 ? 
                Math.round((correctCount / quest.questItemCount) * 100) : 0;

            // 태그 생성 (퀘스트 타입에 따라)
            const tags = this.generateQuestTags(quest.type);

            const questStatus: UserQuestStatusDto = {
                questId: quest.questId,
                title: quest.title,
                type: quest.type,
                order: quest.order,
                tags,
                correctCount,
                totalCount: quest.questItemCount,
                isCompleted,
                isStarted,
                accuracyRate,
                progressRate
            };

            questStatusList.push(questStatus);

            // 활성 퀘스트 결정 (가장 높은 진행률을 가진 미완료 퀘스트)
            if (!isCompleted && (activeQuestId === null || progressRate > 0)) {
                activeQuestId = quest.questId;
            }
        }

        return {
            quests: questStatusList,
            activeQuestId
        };
    }

    async getUserQuestStatus(userId: number, questId: number): Promise<UserQuestStatusDto> {
        // 퀘스트 기본 정보 조회
        const quest = await this.questRepository.findOneBy({ questId });
        if (!quest) {
            throw new NotFoundException('퀘스트를 찾을 수 없습니다.');
        }

        // 사용자 퀘스트 진행 상태 조회
        const userQuest = await this.userQuestRepository.findOne({
            where: { userId, questId },
            relations: ['userQuestItems']
        });

        let correctCount = 0;
        let isStarted = false;
        let isCompleted = false;
        let accuracyRate = 0;

        if (userQuest) {
            isStarted = true;
            isCompleted = userQuest.doneYn;
            accuracyRate = userQuest.accuracyRate;
            
            // 맞힌 문제 수 계산 (correctYn: true인 것만)
            correctCount = await this.userQuestItemRepository.count({
                where: { 
                    userQuestId: userQuest.userQuestId,
                    correctYn: true
                }
            });
        }

        // 진행률 계산
        const progressRate = quest.questItemCount > 0 ? 
            Math.round((correctCount / quest.questItemCount) * 100) : 0;

        // 태그 생성
        const tags = this.generateQuestTags(quest.type);

        return {
            questId: quest.questId,
            title: quest.title,
            type: quest.type,
            order: quest.order,
            tags,
            correctCount,
            totalCount: quest.questItemCount,
            isCompleted,
            isStarted,
            accuracyRate,
            progressRate
        };
    }

    private generateQuestTags(questType: string): string[] {
        // 퀘스트 타입에 따른 태그 생성 로직
        const tagMap: { [key: string]: string[] } = {
            'sound_detection': ['#환경음', '#말소리'],
            'intonation': ['#낱말 검사'],
            'word_length': ['#낱말 검사'],
            'sentence_length': ['#낱말 검사'],
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
        doneYn: boolean,
        totalQuestItemCount: number,
        correctQuestItemCount: number,
        accuracyRate: number
    ): Promise<{ userQuest: UserQuest; userQuestItems: UserQuestItem[] }> {
        // 1. 사용자 퀘스트 조회 및 생성 (startedAt 전달)
        const userQuest = await this.findOrCreateUserQuest(userId, questId, startedAt);

        // 2. 모든 아이템 결과 저장
        const savedItems: UserQuestItem[] = [];
        console.log(`=== submitQuestResult Debug ===`);
        console.log(`userId: ${userId}, questId: ${questId} (${typeof questId})`);
        console.log(`userQuest.userQuestId: ${userQuest.userQuestId}`);
        console.log(`Processing ${items.length} items`);
        
        for (const itemData of items) {
            console.log(`Processing item:`, itemData);
            
            if (!itemData?.questItemId) {
                console.log('Skipping item without questItemId');
                continue;
            }

            // 문제 아이템 조회
            let questItem = await this.questItemRepository.findOneBy({
                questId: Number(questId),
                questItemId: itemData.questItemId,
            });

            if (!questItem) {
                // questItemId가 순차적이지 않을 수 있으므로, 순서 기반으로 조회 시도
                console.log(`Direct lookup failed for questId=${questId}, questItemId=${itemData.questItemId}`);
                
                // 해당 퀘스트의 모든 아이템을 순서대로 조회
                const questItems = await this.questItemRepository.find({
                    where: { questId: Number(questId) },
                    order: { questItemId: 'ASC' }
                });
                
                console.log(`Found ${questItems.length} items for questId=${questId}:`, questItems.map(q => q.questItemId));
                
                // questItemId가 1부터 시작하는 순서라면, 배열 인덱스로 매핑
                const index = itemData.questItemId - 1;
                if (index >= 0 && index < questItems.length) {
                    questItem = questItems[index];
                    console.log(`Mapped questItemId=${itemData.questItemId} to actual questItemId=${questItem.questItemId}`);
                } else {
                    console.log(`Invalid index: questItemId=${itemData.questItemId}, available items: ${questItems.length}`);
                    continue;
                }
            }

            console.log(`Found questItem:`, questItem);

            // 사용자 답변 저장
            const savedItem = await this.processUserAnswer(userQuest, itemData, questItem);
            console.log(`Saved item:`, savedItem);
            savedItems.push(savedItem);
        }

        console.log(`Total saved items: ${savedItems.length}`);

        // 3. 프론트에서 계산한 값으로 퀘스트 업데이트
        await this.userQuestRepository.update(userQuest.userQuestId, {
            doneYn,
            endedAt,
            timeSpent,
            totalQuestItemCount,
            correctQuestItemCount,
            accuracyRate,
        });

        // 4. 업데이트된 userQuest 재조회 (userQuestItems 포함)
        const updatedUserQuest = await this.userQuestRepository.findOne({
            where: { userQuestId: userQuest.userQuestId },
            relations: ['userQuestItems']
        });

        return {
            userQuest: updatedUserQuest || userQuest,
            userQuestItems: savedItems,
        };
    }

    private async findOrCreateUserQuest(userId: number, questId: number, startedAt?: Date): Promise<UserQuest> {
        let userQuest = await this.userQuestRepository.findOneBy({ userId, questId: Number(questId) });
        if (!userQuest) {
            // 사용자 퀘스트 생성
            const quest = await this.questRepository.findOneBy({ questId: Number(questId) });
            if (!quest) {
                throw new NotFoundException('퀘스트를 찾을 수 없습니다.');
            }

            const newUserQuest = this.userQuestRepository.create({
                userId,
                questId: Number(questId),
                doneYn: false,
                startedAt: startedAt || new Date(),
                totalQuestItemCount: quest.questItemCount,
                correctQuestItemCount: 0,
                accuracyRate: 0.00,
            });

            userQuest = await this.userQuestRepository.save(newUserQuest);
        }

        return userQuest;
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
            .innerJoin('quest_items', 'qi', 'qiu.quest_item_unit_id IN (qi.question1, qi.question2, qi.question3)')
            .leftJoin('quest_item_unit_hashtags', 'qiuh', 'qiuh.quest_item_unit_id IN(qi.question1, qi.question2, qi.question3)')
            .innerJoin('user_quest_items', 'uqi', 'uqi.quest_item_id = qi.quest_item_id')
            .innerJoin('user_quests', 'uq', 'uq.user_quest_id = uqi.user_quest_id')
            .where('uq.userId = :userId', { userId })
            .andWhere('uqi.correctYn = :correctYn', { correctYn })
            .andWhere('uqi.attempt_at BETWEEN :startDate AND :endDate', { startDate, endDate })

        if (hashtagIds && hashtagIds.length > 0)
            query.andWhere('qiuh.hashtag_id IN (:...hashtagIds)', { hashtagIds });

        return query.getMany();
    }

    private async processUserAnswer(
        userQuest: UserQuest,
        itemData: Partial<UserQuestItemDto>,
        questItem: QuestItem
    ): Promise<UserQuestItem> {
        console.log(`=== processUserAnswer Debug ===`);
        console.log(`userQuest.userQuestId: ${userQuest.userQuestId}`);
        console.log(`itemData.questItemId: ${itemData.questItemId}`);
        
        // 기존 답변 확인
        const existingItem = await this.userQuestItemRepository.findOneBy({
            userQuestId: userQuest.userQuestId,
            questItemId: itemData.questItemId,
        });

        console.log(`Existing item found: ${!!existingItem}`);

        if (existingItem) {
            console.log(`Updating existing item: ${existingItem.userQuestItemId}`);
            // 기존 답변 업데이트
            if (itemData.userAnswerOx !== undefined) existingItem.userAnswerOx = itemData.userAnswerOx;
            if (itemData.userAnswerSq !== undefined) existingItem.userAnswerSq = itemData.userAnswerSq;
            if (itemData.userAnswer !== undefined) existingItem.userAnswer = itemData.userAnswer;
            if (itemData.correctYn !== undefined) existingItem.correctYn = itemData.correctYn;
            if (itemData.timeSpent !== undefined) existingItem.timeSpent = itemData.timeSpent;
            if (itemData.attemptCount !== undefined) existingItem.attemptCount = itemData.attemptCount;
            existingItem.endedAt = new Date();

            const savedItem = await this.userQuestItemRepository.save(existingItem);
            console.log(`Updated item saved: ${savedItem.userQuestItemId}`);
            return savedItem;
        } else {
            console.log(`Creating new item`);
            // 새 답변 생성
            const newUserQuestItem = this.userQuestItemRepository.create({
                userQuestId: userQuest.userQuestId,
                questItemId: itemData.questItemId,
                userAnswerOx: itemData.userAnswerOx,
                userAnswerSq: itemData.userAnswerSq,
                userAnswer: itemData.userAnswer,
                correctYn: itemData.correctYn,
                timeSpent: itemData.timeSpent,
                attemptCount: itemData.attemptCount,
                startedAt: itemData.startedAt || new Date(),
                endedAt: itemData.endedAt || new Date(),
            });

            const savedItem = await this.userQuestItemRepository.save(newUserQuestItem);
            console.log(`New item saved: ${savedItem.userQuestItemId}`);
            return savedItem;
        }
    }

    private async checkAndFinalizeQuest(userQuest: UserQuest, endedAt?: Date, timeSpent?: number): Promise<void> {
        // 완료된 문제 아이템 수 조회
        const completedItems = await this.userQuestItemRepository.count({
            where: { userQuestId: userQuest.userQuestId }
        });

        // 정답 수 조회
        const correctItems = await this.userQuestItemRepository.count({
            where: { 
                userQuestId: userQuest.userQuestId,
                correctYn: true 
            }
        });

        // 정확도 계산
        const accuracyRate = completedItems > 0 ? (correctItems / completedItems) * 100 : 0;

        // 퀘스트 완료 여부 확인
        const isCompleted = completedItems >= userQuest.totalQuestItemCount;

        // UserQuest 업데이트
        await this.userQuestRepository.update(userQuest.userQuestId, {
            correctQuestItemCount: correctItems,
            accuracyRate: accuracyRate,
            doneYn: isCompleted,
            endedAt: endedAt || (isCompleted ? new Date() : undefined),
            timeSpent: timeSpent !== undefined ? timeSpent : undefined,
        });
    }
}