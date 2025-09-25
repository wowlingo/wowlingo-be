import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserQuestItem } from './entities/user-quest-item.entity';
import { UserQuestItemDto } from './dto/user-quest-item.dto';
import { Quest } from '../quest/entities/quest.entity'
import { QuestItem } from '../quest/entities/quest-item.entity'
import { UserCourse } from '../user/entities/user-course.entity'
import { UserQuest } from './entities/user-quest.entity'
import { min } from 'class-validator';
import it from 'node:test';

@Injectable()
export class UserQuestService {
    constructor(
        @InjectRepository(UserCourse)
        private userCourseRepository: Repository<UserCourse>,
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
        courseId: number,
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

        // 2. 사용자 학습 조회 및 생성
        const userCourse = await this.findOrCreateUserCourse(userId, courseId);
        const userQuest = await this.findOrCreateUserQuest(userCourse, questId);


        // 3. 사용자 답변 저장
        const savedUserQuestItem = await this.processUserAnswer(userQuest, itemData, questItem);


        // 4. 문제집 완료 확인 및 업데이트
        await this.checkAndFinalizeQuest(userQuest);

        return savedUserQuestItem;
    }

    private async findOrCreateUserCourse(userId: number, courseId: number): Promise<UserCourse> {
        let userCourse = await this.userCourseRepository.findOneBy({ userId, courseId });
        if (!userCourse) {
            // 사용자 학습 과정 저장.
            const newUserCourse = this.userCourseRepository.create({
                userId,
                courseId,
                doneYn: false,
                startedAt: new Date(),
            });
            userCourse = await this.userCourseRepository.save(newUserCourse);

            if (!Array.isArray(userCourse.userQuests)) {
                userCourse.userQuests = [];
            }
        }

        return userCourse;
    }

    private async findOrCreateUserQuest(userCourse: UserCourse, questId: number) {
        // TODO:: 첫 문제 풀기 인가? = 문제 Dto의 seq = 0 이면! 
        // 문제 Dto의 seq != 0 인데 userQuest 가 없다? 에러!
        let userQuest = await this.userQuestRepository.findOne({
            where: { userCourseId: userCourse.userCourseId, questId },
            relations: ['userQuestItems']
        });
        if (!userQuest) {
            // 문제 찾기
            const quest = await this.questRepository.findOneBy({ questId });
            if (!quest) {
                throw new NotFoundException(`Quest with ID ${questId} not found.`);
            }

            // 사용자 학습 문제집 생성시, 초기값 설정.
            // done_yn = n, started_at, total count 저장.
            const newUserQuest = this.userQuestRepository.create({
                userCourseId: userCourse.userCourseId,
                questId,
                doneYn: false,
                startedAt: new Date(),
                totalQuestItemCount: quest.questItemCount,
                correctQuestItemCount: 0,
                accuracyRate: 0,
            });
            userQuest = await this.userQuestRepository.save(newUserQuest);
            userQuest.userQuestItems = [];
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

    private async processUserAnswer(userQuest: UserQuest, itemData: Partial<UserQuestItemDto>, questItem: QuestItem) {
        const userQuestItem = this.userQuestItemRepository.create({
            ...itemData,
            userQuest,
            correctYn: itemData.userAnswerSq === questItem.answerSq,
            timeSpent: this.calculateTimeSpent(new Date(), itemData.attemptAt),
            questItem: itemData.questItemJson ?? null,
        });

        return await this.userQuestItemRepository.save(userQuestItem);
    }

    private async checkAndFinalizeQuest(userQuest: UserQuest) {
        // 사용자 학습 문제 갯수 
        const currentItemCount = await this.userQuestItemRepository.countBy({ userQuestId: userQuest.userQuestId });

        if (userQuest.totalQuestItemCount === currentItemCount && !userQuest.doneYn) {
            const correctCount = await this.userQuestItemRepository.countBy({
                userQuestId: userQuest.userQuestId,
                correctYn: true
            });

            const doneYn = true;
            const endedAt = new Date();
            const timeSpent = this.calculateTimeSpent(userQuest.startedAt, endedAt);
            const correctQuestItemCount = correctCount;
            const accuracyRate = (userQuest.correctQuestItemCount / userQuest.totalQuestItemCount) * 100;

            await this.userQuestRepository.update(userQuest.userQuestId, {
                doneYn: doneYn,
                endedAt: endedAt,
                timeSpent: timeSpent,
                correctQuestItemCount: correctQuestItemCount,
                accuracyRate: accuracyRate,
            }); // save?
        }
    }
}