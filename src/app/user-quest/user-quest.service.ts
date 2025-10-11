import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserQuestItem } from './entities/user-quest-item.entity';
import { UserQuestItemDto } from './dto/user-quest-item.dto';
import { Quest } from '../quest/entities/quest.entity'
import { QuestItem } from '../quest/entities/quest-item.entity'
import { User } from '../user/entities/user.entity'
import { UserQuest } from './entities/user-quest.entity'

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

    private async findOrCreateUserQuest(userId: number, questId: number): Promise<UserQuest> {
        let userQuest = await this.userQuestRepository.findOneBy({ userId, questId });
        if (!userQuest) {
            // 사용자 퀘스트 생성
            const quest = await this.questRepository.findOneBy({ questId });
            if (!quest) {
                throw new NotFoundException('퀘스트를 찾을 수 없습니다.');
            }

            const newUserQuest = this.userQuestRepository.create({
                userId,
                questId,
                doneYn: false,
                startedAt: new Date(),
                totalQuestItemCount: quest.questItemCount,
                correctQuestItemCount: 0,
                accuracyRate: 0.00,
            });

            userQuest = await this.userQuestRepository.save(newUserQuest);
        }

        return userQuest;
    }

    private async processUserAnswer(
        userQuest: UserQuest,
        itemData: Partial<UserQuestItemDto>,
        questItem: QuestItem
    ): Promise<UserQuestItem> {
        // 기존 답변 확인
        const existingItem = await this.userQuestItemRepository.findOneBy({
            userQuestId: userQuest.userQuestId,
            questItemId: itemData.questItemId,
        });

        if (existingItem) {
            // 기존 답변 업데이트
            if (itemData.userAnswerOx !== undefined) existingItem.userAnswerOx = itemData.userAnswerOx;
            if (itemData.userAnswerSq !== undefined) existingItem.userAnswerSq = itemData.userAnswerSq;
            if (itemData.userAnswer !== undefined) existingItem.userAnswer = itemData.userAnswer;
            if (itemData.correctYn !== undefined) existingItem.correctYn = itemData.correctYn;
            if (itemData.timeSpent !== undefined) existingItem.timeSpent = itemData.timeSpent;
            if (itemData.attemptCount !== undefined) existingItem.attemptCount = itemData.attemptCount;
            existingItem.endedAt = new Date();

            return await this.userQuestItemRepository.save(existingItem);
        } else {
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
                startedAt: new Date(),
                endedAt: new Date(),
            });

            return await this.userQuestItemRepository.save(newUserQuestItem);
        }
    }

    private async checkAndFinalizeQuest(userQuest: UserQuest): Promise<void> {
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
            endedAt: isCompleted ? new Date() : undefined,
        });
    }
}