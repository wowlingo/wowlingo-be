import { Controller, Get, Post, Param, Body, ParseIntPipe, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BaseResponse } from '../../common/dto/base-response.dto';
import { UserQuestItem } from './entities/user-quest-item.entity';
import { UserQuestItemDto } from './dto/user-quest-item.dto'
import { UserQuestService } from './user-quest.service'

@ApiTags('UserQuests')
@Controller('user-quests')
export class UserQuestController {
    constructor(private readonly userQuestService: UserQuestService) { }

    @Post(':userId/:courseId/:questId/item')
    @ApiOperation({ summary: '사용자 퀘스트 아이템 생성' })
    @ApiResponse({ status: 201, description: '사용자 퀘스트 아이템 생성 성공' })
    async createQuestItem(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('courseId', ParseIntPipe) courseId: number,
        @Param('questId', ParseIntPipe) questId: number,
        @Body() questItemData: UserQuestItemDto)
        : Promise<BaseResponse<UserQuestItem>> {
        const questItem = await this.userQuestService.createUserQuestItem(
            userId,
            courseId,
            questId,
            questItemData
        );
        if (!questItem) {
            // null이면, "찾을 수 없음" 예외를 발생시켜 404 에러를 반환
            throw new NotFoundException('해당 퀘스트 아이템을 생성하거나 찾을 수 없습니다.');
        }

        return BaseResponse.success(questItem, '퀘스트 아이템이 성공적으로 저장되었습니다.');
    }

}
