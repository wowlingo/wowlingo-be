/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserQuestService } from '../user-quest.service';
import { QuestItem } from '../../quest/entities/quest-item.entity';
import { UserCourse } from '../../user/entities/user-course.entity';
import { UserQuest } from '../entities/user-quest-session.entity';
import { Quest } from '../../quest/entities/quest.entity';
import { UserQuestItem } from '../entities/user-quest-item.entity';
import { NotFoundException } from '@nestjs/common';

// Mock Repository 타입 정의
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

// Mock Repository 생성 함수
const createMockRepository = <T = any>(): MockRepository<T> => ({
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    countBy: jest.fn(),
});

describe('UserQuestService', () => {
    let service: UserQuestService;
    // 각 Repository에 대한 Mock 변수 선언
    let questItemRepository: MockRepository<QuestItem>;
    let userCourseRepository: MockRepository<UserCourse>;
    let userQuestRepository: MockRepository<UserQuest>;
    let questRepository: MockRepository<Quest>;
    let userQuestItemRepository: MockRepository<UserQuestItem>;

    // 테스트에 사용할 기본 데이터
    const userId = 1;
    const courseId = 1;
    const questId = 1;
    const questItemId = 101;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserQuestService,
                {
                    provide: getRepositoryToken(QuestItem),
                    useValue: createMockRepository(),
                },
                {
                    provide: getRepositoryToken(UserCourse),
                    useValue: createMockRepository(),
                },
                {
                    provide: getRepositoryToken(UserQuest),
                    useValue: createMockRepository(),
                },
                {
                    provide: getRepositoryToken(Quest),
                    useValue: createMockRepository(),
                },
                {
                    provide: getRepositoryToken(UserQuestItem),
                    useValue: createMockRepository(),
                },
            ],
        }).compile();

        service = module.get<UserQuestService>(UserQuestService);
        questItemRepository = module.get(getRepositoryToken(QuestItem));
        userCourseRepository = module.get(getRepositoryToken(UserCourse));
        userQuestRepository = module.get(getRepositoryToken(UserQuest));
        questRepository = module.get(getRepositoryToken(Quest));
        userQuestItemRepository = module.get(getRepositoryToken(UserQuestItem));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createUserQuestItem', () => {
        // --- 1. 성공 케이스: 새로운 퀘스트의 첫 문제 풀이 ---
        it('should successfully create a UserQuestItem for a new quest', async () => {
            // Arrange (준비)
            const attemptAt = new Date();
            const itemData = { questItemId, userAnswerSq: 'A', attemptAt };

            const mockQuestItem = { questItemId, answerSq: 'A' } as QuestItem;
            const mockQuest = { questId, questItemCount: 5 } as Quest;
            const mockUserCourse = { userCourseId: 1, userId, courseId } as UserCourse;
            const mockUserQuest = { userQuestId: 1, totalQuestItemCount: 5, doneYn: false, startedAt: new Date() } as UserQuest;
            const mockUserQuestItem = { userQuestItemId: 1, correctYn: true } as UserQuestItem;

            // Mock 함수들의 반환값 설정
            questItemRepository!.findOneBy.mockResolvedValue(mockQuestItem);
            userCourseRepository!.findOneBy.mockResolvedValue(null); // UserCourse가 없어서 새로 생성
            userCourseRepository!.save.mockResolvedValue(mockUserCourse);
            userQuestRepository!.findOne.mockResolvedValue(null); // UserQuest가 없어서 새로 생성
            questRepository!.findOneBy.mockResolvedValue(mockQuest);
            userQuestRepository!.save.mockResolvedValue(mockUserQuest);
            userQuestItemRepository!.create.mockReturnValue(mockUserQuestItem);
            userQuestItemRepository!.save.mockResolvedValue(mockUserQuestItem);
            userQuestItemRepository!.countBy.mockResolvedValue(1); // 퀘스트 완료 체크 시, 현재 1개

            // Act (실행)
            const result = await service.createUserQuestItem(userId, courseId, questId, itemData);

            // Assert (검증)
            expect(result).toEqual(mockUserQuestItem);
            expect(questItemRepository.findOneBy).toHaveBeenCalledWith({ questId, questItemId });
            expect(userCourseRepository.save).toHaveBeenCalledTimes(1); // UserCourse 생성
            expect(userQuestRepository.save).toHaveBeenCalledTimes(1); // UserQuest 생성
            expect(userQuestItemRepository.save).toHaveBeenCalledWith(mockUserQuestItem);
        });

        // --- 2. 성공 케이스: 퀘스트의 마지막 문제 풀이 및 완료 처리 ---
        it('should finalize the quest when the last item is answered', async () => {
            // Arrange
            const itemData = { questItemId, userAnswerSq: 'B', attemptAt: new Date() };

            const mockQuestItem = { questItemId, answerSq: 'B' } as QuestItem;
            const mockUserCourse = { userCourseId: 1 } as UserCourse;
            // UserQuest가 이미 존재, 4/5 문제 푼 상태라고 가정
            const mockUserQuest = { userQuestId: 1, totalQuestItemCount: 5, doneYn: false, startedAt: new Date() } as UserQuest;
            const mockUserQuestItem = { userQuestItemId: 1, correctYn: true } as UserQuestItem;

            questItemRepository.findOneBy.mockResolvedValue(mockQuestItem);
            userCourseRepository.findOneBy.mockResolvedValue(mockUserCourse); // UserCourse는 이미 존재
            userQuestRepository.findOne.mockResolvedValue(mockUserQuest); // UserQuest도 이미 존재
            userQuestItemRepository.create.mockReturnValue(mockUserQuestItem);
            userQuestItemRepository.save.mockResolvedValue(mockUserQuestItem);

            // 퀘스트 완료 여부 체크 시
            userQuestItemRepository.countBy
                .mockResolvedValueOnce(5) // totalQuestItemCount와 동일 -> 완료 처리 로직 실행
                .mockResolvedValueOnce(4); // 정답 개수 카운트

            // Act
            await service.createUserQuestItem(userId, courseId, questId, itemData);

            // Assert
            // userQuestRepository.save가 퀘스트 완료 업데이트를 위해 호출되었는지 확인
            expect(userQuestRepository.save).toHaveBeenCalledTimes(1);
            expect(userQuestRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    doneYn: true,
                    correctQuestItemCount: 4,
                    accuracyRate: (4 / 5) * 100,
                }),
            );
        });

        // --- 3. 예외 케이스: 존재하지 않는 문제 아이템 ---
        it('should throw NotFoundException if questItem does not exist', async () => {
            // Arrange
            const itemData = { questItemId, userAnswerSq: 'A' };
            questItemRepository.findOneBy.mockResolvedValue(null); // DB에 QuestItem이 없음

            // Act & Assert
            await expect(
                service.createUserQuestItem(userId, courseId, questId, itemData)
            ).rejects.toThrow(NotFoundException);
        });

        // --- 4. 예외 케이스: 입력 데이터 오류 ---
        it('should throw an Error if questItemId is not provided', async () => {
            // Arrange
            const invalidItemData = { userAnswerSq: 'A' }; // questItemId가 없음

            // Act & Assert
            await expect(
                service.createUserQuestItem(userId, courseId, questId, invalidItemData)
            ).rejects.toThrow('Quest item ID is required.');
        });
    });
});