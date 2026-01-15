import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { QuestService } from './quest.service';
import { Quest } from './entities/quest.entity';
import { QuestItem } from './entities/quest-item.entity';
import { QuestItemUnit } from './entities/quest-item-unit.entity';
import { BaseResponse } from '../../common/dto/base-response.dto';
import { QuestDataDto } from './dto/quest-data.dto'
import { QuestResDto } from './dto/quest-res.dto'
import { HashtagService } from '../hashtag/hashtag.service';

@ApiTags('Quests')
@Controller('quests')
export class QuestController {
  constructor(
    private readonly questService: QuestService,
    private readonly hashtagService: HashtagService,
  ) {}

  // Quest 엔드포인트
  @Get()
  @ApiOperation({ summary: '모든 퀘스트 조회' })
  @ApiResponse({ status: 200, description: '퀘스트 목록 조회 성공' })
  async findAllQuests(): Promise<BaseResponse<QuestResDto[]>> {
    const quests = await this.questService.findAllQuests();

    const questIds = quests.flatMap(it => it.questId).filter((id): id is number => id !== null);
    const hashtags = await this.hashtagService.findGroupNamesByQuests(questIds);

    const resDtos = await this.questService.makeQuests(quests, hashtags);
    
    return BaseResponse.success(resDtos, '퀘스트 목록을 성공적으로 조회했습니다.');
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 퀘스트 조회' })
  @ApiResponse({ status: 200, description: '퀘스트 조회 성공' })
  async findQuestById(@Param('id', ParseIntPipe) id: number): Promise<BaseResponse<QuestDataDto>> {
    const quest = await this.questService.findQuestDataById(id);
    return BaseResponse.success(quest, '퀘스트 정보를 성공적으로 조회했습니다.');
  }

  @Post()
  @ApiOperation({ summary: '새 퀘스트 생성' })
  @ApiResponse({ status: 201, description: '퀘스트 생성 성공' })
  async createQuest(@Body() questData: Partial<Quest>): Promise<BaseResponse<Quest>> {
    const quest = await this.questService.createQuest(questData);
    return BaseResponse.success(quest, '퀘스트가 성공적으로 생성되었습니다.');
  }

  @Put(':id')
  @ApiOperation({ summary: '코스 정보 수정' })
  @ApiResponse({ status: 200, description: '코스 정보 수정 성공' })
  async updateQuest(
    @Param('id', ParseIntPipe) id: number,
    @Body() questData: Partial<Quest>,
  ): Promise<BaseResponse<Quest>> {
    const quest = await this.questService.updateQuest(id, questData);
    return BaseResponse.success(quest, '코스 정보가 성공적으로 수정되었습니다.');
  }

  @Delete(':id')
  @ApiOperation({ summary: '코스 삭제' })
  @ApiResponse({ status: 200, description: '코스 삭제 성공' })
  async removeQuest(@Param('id', ParseIntPipe) id: number): Promise<BaseResponse<void>> {
    await this.questService.removeQuest(id);
    return BaseResponse.success(undefined, '코스가 성공적으로 삭제되었습니다.');
  }

  // QuestItem 엔드포인트
  @Get('items')
  @ApiOperation({ summary: '모든 퀘스트 아이템 조회' })
  @ApiQuery({ name: 'questId', required: false, description: '퀘스트 ID로 필터링' })
  @ApiResponse({ status: 200, description: '퀘스트 아이템 목록 조회 성공' })
  async findAllQuestItems(@Query('questId') questId?: string): Promise<BaseResponse<QuestItem[]>> {
    let questItems: QuestItem[];
    
    if (questId) {
      questItems = await this.questService.findQuestItemsByQuestId(parseInt(questId));
    } else {
      questItems = await this.questService.findAllQuestItems();
    }
    
    return BaseResponse.success(questItems, '퀘스트 아이템 목록을 성공적으로 조회했습니다.');
  }

  @Get('items/:id')
  @ApiOperation({ summary: '특정 퀘스트 아이템 조회' })
  @ApiResponse({ status: 200, description: '퀘스트 아이템 조회 성공' })
  async findQuestItemById(@Param('id', ParseIntPipe) id: number): Promise<BaseResponse<QuestItem>> {
    const questItem = await this.questService.findQuestItemById(id);
    return BaseResponse.success(questItem, '퀘스트 아이템 정보를 성공적으로 조회했습니다.');
  }

  @Post('items')
  @ApiOperation({ summary: '새 퀘스트 아이템 생성' })
  @ApiResponse({ status: 201, description: '퀘스트 아이템 생성 성공' })
  async createQuestItem(@Body() questItemData: Partial<QuestItem>): Promise<BaseResponse<QuestItem>> {
    const questItem = await this.questService.createQuestItem(questItemData);
    return BaseResponse.success(questItem, '퀘스트 아이템이 성공적으로 생성되었습니다.');
  }

  // QuestItemUnit 엔드포인트
  @Get('units')
  @ApiOperation({ summary: '모든 퀘스트 아이템 유닛 조회' })
  @ApiQuery({ name: 'questItemId', required: false, description: '퀘스트 아이템 ID로 필터링' })
  @ApiResponse({ status: 200, description: '퀘스트 아이템 유닛 목록 조회 성공' })
  async findAllQuestItemUnits(@Query('questItemId') questItemId?: string): Promise<BaseResponse<QuestItemUnit[]>> {
    let questItemUnits: QuestItemUnit[];
    
    // if (questItemId) {
      // questItemUnits = await this.questService.findQuestItemUnitsByQuestItemId(parseInt(questItemId));
    // } else {
      questItemUnits = await this.questService.findAllQuestItemUnits();
    // }
    
    return BaseResponse.success(questItemUnits, '퀘스트 아이템 유닛 목록을 성공적으로 조회했습니다.');
  }

  @Get('units/:id')
  @ApiOperation({ summary: '특정 퀘스트 아이템 유닛 조회' })
  @ApiResponse({ status: 200, description: '퀘스트 아이템 유닛 조회 성공' })
  async findQuestItemUnitById(@Param('id', ParseIntPipe) id: number): Promise<BaseResponse<QuestItemUnit>> {
    const questItemUnit = await this.questService.findQuestItemUnitById(id);
    return BaseResponse.success(questItemUnit, '퀘스트 아이템 유닛 정보를 성공적으로 조회했습니다.');
  }

  @Post('units')
  @ApiOperation({ summary: '새 퀘스트 아이템 유닛 생성' })
  @ApiResponse({ status: 201, description: '퀘스트 아이템 유닛 생성 성공' })
  async createQuestItemUnit(@Body() questItemUnitData: Partial<QuestItemUnit>): Promise<BaseResponse<QuestItemUnit>> {
    const questItemUnit = await this.questService.createQuestItemUnit(questItemUnitData);
    return BaseResponse.success(questItemUnit, '퀘스트 아이템 유닛이 성공적으로 생성되었습니다.');
  }
}
