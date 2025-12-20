import { ApiProperty } from '@nestjs/swagger';
import { FruitType } from '../fruit.enum';

export class UserQuestStatusDto {
  @ApiProperty({ description: '퀘스트 ID', example: 1 })
  questId: number;

  @ApiProperty({ description: '퀘스트 제목', example: '소리의 감지' })
  title: string;

  @ApiProperty({ description: '퀘스트 타입', example: 'sound_detection' })
  type: string;

  @ApiProperty({ description: '퀘스트 순서', example: 1 })
  order: number;

  @ApiProperty({ description: '퀘스트 태그 목록', example: ['#환경음', '#말소리'] })
  tags: string[];

  @ApiProperty({ description: '맞힌 문제 수', example: 12 })
  correctCount: number;

  @ApiProperty({ description: '총 문제 수', example: 70 })
  totalCount: number;

  @ApiProperty({ description: '퀘스트 완료 여부', example: false })
  isCompleted: boolean;

  @ApiProperty({ description: '퀘스트 시작 여부', example: true })
  isStarted: boolean;

  @ApiProperty({ description: '퀘스트 사용가능 여부', example: true })
  isEnable: boolean;

  @ApiProperty({ description: '정답률 (%)', example: 85.7 })
  accuracyRate: number;

  @ApiProperty({ description: '진행률 (%)', example: 17.1 })
  progressRate: number;
}

export class UserQuestListResponseDto {
  @ApiProperty({ 
    description: '사용자 퀘스트 목록', 
    type: [UserQuestStatusDto] 
  })
  quests: UserQuestStatusDto[];

  @ApiProperty({ description: '현재 활성 퀘스트 ID', example: 1 })
  activeQuestId: number | null;

  @ApiProperty({ description: '현재 열매 타입' })
  fruit: FruitType;

  @ApiProperty({ description: '현재 열매 레벨' })
  fruitLevel: number;

  @ApiProperty({ description: '다음 레벨까지 남은 문제 개수' })
  nextLevelCount: number;
}
