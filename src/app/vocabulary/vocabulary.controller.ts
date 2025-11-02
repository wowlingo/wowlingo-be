import { Controller, Get, Post, Delete, Param, Body, ParseIntPipe, Query, BadRequestException, ParseArrayPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BaseResponse } from '../../common/dto/base-response.dto';
import { VocabularyService } from './vocabulary.service';
import { QuestService } from '../quest/quest.service';
import { HashtagService } from '../hashtag/hashtag.service';
import { VocabQuestReqDto } from './dto/vocab-quest-req.dto';
import { VocabDto } from './dto/vocab.dto';
import { Vocabulary } from './entities/vocabulary.entity';
import { Hashtag } from '../hashtag/entities/hashtag.entity';

@ApiTags('Vocabulary')
@Controller('vocabulary')
export class VocabularyController {
    constructor(
        private readonly vocabularyService: VocabularyService,
        private readonly questService: QuestService,
        private readonly hashtagService: HashtagService
    ) { }

    @Get("/hashtags")
    @ApiOperation({ summary: '해시태그 목록 조회' })
    @ApiResponse({ status: 200, description: '단어장 목록 조회 성공' })
    async findAllHashtags(
        @Query('userId') userId: number
    ): Promise<BaseResponse<Hashtag[]>> {
        const hashtags = await this.hashtagService.findAllByVocabularyUserId(userId)

        return BaseResponse.success(hashtags, '해시태그 목록을 성공적으로 조회했습니다.');
    }


    @Get()
    @ApiOperation({ summary: '모든 단어장 조회, 정렬가능(기본은 최신순), 해시태그로 필터링 가능' })
    @ApiQuery({
        name: 'hashtags', required: false, description: '해쉬태그 id'
    })
    @ApiQuery({
        name: 'sort', required: false, description: '정렬: latest=최신순(기본값), oldest=오랜된순'
    })
    @ApiResponse({ status: 200, description: '단어장 목록 조회 성공' })
    async findAllQuests(
        @Query('userId') userId: number,
        @Query('hashtags', new ParseArrayPipe({ items: Number, optional: true })) hashtagIds: number[] = [],
        @Query('sort') sort?: string | null,

    ): Promise<BaseResponse<Vocabulary[]>> {
        // let hashtagIds: number[] = [];

        // if (Array.isArray(hashtags)) {
        //     hashtagIds = hashtags.map(Number);
        // } else if (typeof hashtags === 'string') {
        //     // "1,2,3" 형태로 들어오는 경우
        //     hashtagIds = hashtags.split(',').map(Number);
        // }

        const vacabulary = await this.vocabularyService.findAllByHashtags(userId, hashtagIds, sort)

        return BaseResponse.success(vacabulary, '단어장 목록을 성공적으로 조회했습니다.');
    }

    @Post()
    @ApiOperation({ summary: '단어장 등록' })
    @ApiResponse({ status: 200, description: '단어장 생성 성공' })
    async createVocab(@Body() vocabReqDto: VocabQuestReqDto): Promise<BaseResponse<Vocabulary>> {

        const hashtags = await this.hashtagService.findAllByQuestItemUnitId(vocabReqDto.questItemUnitId);
        const questItemUnit = await this.questService.findQuestItemUnitById(vocabReqDto.questItemUnitId);

        const vocab = await this.vocabularyService.createVocab(vocabReqDto.userId, hashtags, questItemUnit);

        return BaseResponse.success(vocab, '단어장 성공적으로 생성/등록 되었습니다.');
    }

    @Delete(':id')
    @ApiOperation({ summary: '특정 단어장 단어 삭제' })
    @ApiResponse({ status: 200, description: '단어장 단어 삭제 성공' })
    async findQuestById(@Param('id', ParseIntPipe) id: number): Promise<BaseResponse<void>> {
        await this.vocabularyService.removeVoca(id);
        return BaseResponse.success(undefined, '퀘스트 정보를 성공적으로 조회했습니다.');
    }

}