import { Controller, Get, Post, Param, Body, ParseIntPipe, Query, NotFoundException, ParseArrayPipe } from '@nestjs/common';
import { ParseDatePipe } from 'src/common/pipes/parse-date.pipe';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BaseResponse } from '../../common/dto/base-response.dto';
import { UserQuest } from './entities/user-quest.entity';
import { SubmitQuestResultDto } from './dto/submit-quest-result.dto'
import { HashtagService } from '../hashtag/hashtag.service';
import { Hashtag } from '../hashtag/entities/hashtag.entity';
import { QuestItemUnit } from '../quest/entities/quest-item-unit.entity';
import { UserQuestService } from './user-quest.service';
import { UserQuestListResponseDto } from './dto/user-quest-status.dto';
import { ReviewQuestItemDto } from './dto/review-quest-item.dto';
import { QuestService } from '../quest/quest.service';

@ApiTags('UserQuests')
@Controller('user-quests')
export class UserQuestController {
    constructor(
        private readonly userQuestService: UserQuestService,
        private readonly hashtagService: HashtagService,
        private readonly questService: QuestService,
    ) { }

    @Post(':userId/:questId/submit')
    @ApiOperation({ summary: '퀘스트 전체 결과 제출' })
    @ApiResponse({ status: 201, description: '퀘스트 결과 제출 성공' })
    async submitQuestResult(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('questId', ParseIntPipe) questId: number,
        @Body() resultData: SubmitQuestResultDto)
        : Promise<BaseResponse<{ userQuest: UserQuest & { userQuestItems: any[] } }>> {
        const result = await this.userQuestService.submitQuestResult(
            userId,
            questId,
            resultData.items,
            resultData.startedAt,
            resultData.endedAt,
            resultData.timeSpent,
            resultData.totalQuestItemCount,
            resultData.correctQuestItemCount,
            resultData.accuracyRate
        );

        return BaseResponse.success(result, '퀘스트 결과가 성공적으로 저장되었습니다.');
    }

    // 오답노트
    // 해시태그 조회 (by date)
    @Get('/review-notes/hashtags')
    @ApiOperation({ summary: '사용자 오답노트 해시태그 조회' })
    @ApiQuery({
        name: 'date', required: false, description: '검색 날짜. 기본값은 오늘.'
    })
    @ApiResponse({ status: 201, description: '사용자 오답노트 해시태그 조회 성공' })
    async getReviewNoteHashtags(
        @Query('userId', ParseIntPipe) userId: any,
        @Query('date', ParseDatePipe) date?: Date
    ): Promise<BaseResponse<Hashtag[]>> {
        console.log('userId:', userId, typeof userId);

        if (!date) date = new Date();
        const questItemUnits = await this.userQuestService.getQuestItemsByCorrectYnAndStartedAt(userId, false, date);
        const ids = questItemUnits.flatMap(it => [it.question1, it.question2]).filter((id): id is number => id !== null);
        const hashtags = await this.hashtagService.findAllByQuestItemUnitIds(ids);

        return BaseResponse.success(hashtags, '해시태그 조회 성공.');
    }

    // 틀린 문제 목록 조회 (by date, tags)
    @Get('/review-notes')
    @ApiOperation({ summary: '사용자 오답노트 조회' })
    @ApiQuery({
        name: 'date', required: false, description: '검색 날짜. 기본값은 오늘.'
    })
    @ApiQuery({
        name: 'hashtags', required: false, description: '해쉬태그 id'
    })
    @ApiResponse({ status: 201, description: '사용자 오답노트 조회 성공' })
    async getReviewNotes(
        @Query('userId', ParseIntPipe) userId: number,
        @Query('date', ParseDatePipe) date?: Date,
        @Query('hashtags', new ParseArrayPipe({ items: Number, optional: true })) hashtagIds: number[] = []
    ): Promise<BaseResponse<ReviewQuestItemDto[]>> {//Promise<BaseResponse<AdminQuestResDto[]>>
        if (!date) date = new Date();
        // const questItemUnits1 = await this.userQuestService.getQuestItemUnitsByCorrectYnAndAttemptAtAndHashtags(userId, false, date, hashtagIds, 'question1');
        // const questItemUnits2 = await this.userQuestService.getQuestItemUnitsByCorrectYnAndAttemptAtAndHashtags(userId, false, date, hashtagIds, 'question2');

        const questItems = await this.userQuestService.getQuestItemsByCorrectYnAndAttemptAtAndHashtags(userId, false, date, hashtagIds);

        const questItemIds = questItems.flatMap(it => it.questItemId).filter((id): id is number => id !== null);
        if (!questItemIds || questItemIds.length === 0) {
            return BaseResponse.success([], '오답노트 조회 성공.');
        }

        const questItemUnits1 = await this.userQuestService.getQuestItemUnitsByQuestItemIds(questItemIds, 'question1');
        const questItemUnits2 = await this.userQuestService.getQuestItemUnitsByQuestItemIds(questItemIds, 'question2');

        const questItemUnits = [...questItemUnits1, ...questItemUnits2];
        const reivewQuestItemDtos = await this.userQuestService.makeReviewQuestItemDto(questItemUnits);

        return BaseResponse.success(reivewQuestItemDtos, '오답노트 조회 성공.');
    }

    @Get(':userId')
    @ApiOperation({ summary: '사용자의 모든 퀘스트 목록 조회 (홈 화면용)' })
    @ApiResponse({
        status: 200,
        description: '사용자 퀘스트 상태 목록 조회 성공',
        type: UserQuestListResponseDto
    })
    async getUserQuestStatusList(
        @Param('userId', ParseIntPipe) userId: number)
        : Promise<BaseResponse<UserQuestListResponseDto>> {
        const result = await this.userQuestService.getUserQuestStatusList(userId);

        return BaseResponse.success(result, '퀘스트 상태 목록 조회 성공.');
    }
}
