import { Controller, Get, Post, Param, Body, ParseIntPipe, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BaseResponse } from '../../common/dto/base-response.dto';
import { UserQuest } from './entities/user-quest.entity';
import { UserQuestItem } from './entities/user-quest-item.entity';
import { UserQuestItemDto } from './dto/user-quest-item.dto'
import { SubmitQuestResultDto } from './dto/submit-quest-result.dto'
import { UserQuestService } from './user-quest.service'

@ApiTags('UserQuests')
@Controller('user-quests')
export class UserQuestController {
    constructor(private readonly userQuestService: UserQuestService) { }

    @Post(':userId/:questId/submit')
    @ApiOperation({ summary: '퀘스트 전체 결과 제출' })
    @ApiResponse({ status: 201, description: '퀘스트 결과 제출 성공' })
    async submitQuestResult(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('questId', ParseIntPipe) questId: number,
        @Body() resultData: SubmitQuestResultDto)
        : Promise<BaseResponse<{ userQuest: UserQuest; userQuestItems: UserQuestItem[] }>> {
        const result = await this.userQuestService.submitQuestResult(
            userId,
            questId,
            resultData.items,
            resultData.startedAt,
            resultData.endedAt,
            resultData.timeSpent,
            resultData.doneYn,
            resultData.totalQuestItemCount,
            resultData.correctQuestItemCount,
            resultData.accuracyRate
        );

        return BaseResponse.success(result, '퀘스트 결과가 성공적으로 저장되었습니다.');
    }

    @Post(':userId/:questId/item')
    @ApiOperation({ summary: '사용자 퀘스트 아이템 생성' })
    @ApiResponse({ status: 201, description: '사용자 퀘스트 아이템 생성 성공' })
    async createQuestItem(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('questId', ParseIntPipe) questId: number,
        @Body() questItemData: UserQuestItemDto)
        : Promise<BaseResponse<UserQuestItem>> {
        const questItem = await this.userQuestService.createUserQuestItem(
            userId,
            questId,
            questItemData
        );
        if (!questItem) {
            // null이면, "찾을 수 없음" 예외를 발생시켜 404 에러를 반환
            throw new NotFoundException('해당 퀘스트 아이템을 생성하거나 찾을 수 없습니다.');
        }

        return BaseResponse.success(questItem, '퀘스트 아이템이 성공적으로 저장되었습니다.');
    }

    @Get(':userId/:questId')
    @ApiOperation({ summary: '사용자 퀘스트 조회' })
    @ApiResponse({ status: 200, description: '사용자 퀘스트 조회 성공' })
    async getUserQuest(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('questId', ParseIntPipe) questId: number)
        : Promise<BaseResponse<UserQuest>> {
        const quest = await this.userQuestService.getUserQuest(
            userId,
            questId
        );
        if (!quest) {
            // null이면, "찾을 수 없음" 예외를 발생시켜 404 에러를 반환
            throw new NotFoundException('해당 퀘스트를 찾을 수 없습니다.');
        }

        return BaseResponse.success(quest, '퀘스트 조회 성공.');
    }

    @Get(':userId')
    @ApiOperation({ summary: '사용자의 모든 퀘스트 목록 조회' })
    @ApiResponse({ status: 200, description: '사용자 퀘스트 목록 조회 성공' })
    async getUserQuests(
        @Param('userId', ParseIntPipe) userId: number)
        : Promise<BaseResponse<UserQuest[]>> {
        const quests = await this.userQuestService.getUserQuests(userId);
        
        return BaseResponse.success(quests, '퀘스트 목록 조회 성공.');
    }


}
