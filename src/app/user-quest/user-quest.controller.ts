import { Controller, Get, Post, Param, Body, ParseIntPipe, Query, NotFoundException, ParseArrayPipe } from '@nestjs/common';
import { ParseDatePipe } from 'src/common/pipes/parse-date.pipe';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BaseResponse } from '../../common/dto/base-response.dto';
import { UserQuest } from './entities/user-quest.entity';
import { UserQuestItem } from './entities/user-quest-item.entity';
import { UserQuestItemDto } from './dto/user-quest-item.dto'
import { UserQuestService } from './user-quest.service'
import { Any } from 'typeorm';
import { HashtagService } from '../hashtag/hashtag.service';
import { Hashtag } from '../hashtag/entities/hashtag.entity';
import { QuestItemUnit } from '../quest/entities/quest-item-unit.entity';

@ApiTags('UserQuests')
@Controller('user-quests')
export class UserQuestController {
    constructor(
        private readonly userQuestService: UserQuestService,
        private readonly hashtagService: HashtagService
    ) { }

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

    @Get(':userId/:courseId/:questId')
    @ApiOperation({ summary: '사용자 퀘스트 조회' })
    @ApiResponse({ status: 201, description: '사용자 퀘스트 아이템 생성 성공' })
    async getUserQuest(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('courseId', ParseIntPipe) courseId: number,
        @Param('questId', ParseIntPipe) questId: number)
        : Promise<BaseResponse<UserQuest>> {
        const quest = await this.userQuestService.getUserQuest(
            userId,
            courseId,
            questId
        );
        if (!quest) {
            // null이면, "찾을 수 없음" 예외를 발생시켜 404 에러를 반환
            throw new NotFoundException('해당 퀘스트를 찾을 수 없습니다.');
        }

        return BaseResponse.success(quest, '퀘스트 조회 성공.');
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
        @Query('userId', ParseIntPipe) userId: number,
        @Query('date', ParseDatePipe) date?: Date
    ): Promise<BaseResponse<Hashtag[]>> {
        if (!date) date = new Date();
        const questItemUnits = await this.userQuestService.getQuestItemsByCorrectYnAndAttemptAt(userId, false, date);
        const ids = questItemUnits.flatMap(it => [it.question1, it.question2, it.question3]).filter(Boolean);
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
    ): Promise<BaseResponse<QuestItemUnit[]>> {
        if (!date) date = new Date();
        const questItemUnits = await this.userQuestService.getQuestItemUnitsByCorrectYnAndAttemptAtAndHashtags(userId, false, date, hashtagIds);

        return BaseResponse.success(questItemUnits, '오답노트 조회 성공.');
    }

}
