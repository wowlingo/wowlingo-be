import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserQuestItemDto } from './user-quest-item.dto';

export class SubmitQuestResultDto {
  @ApiProperty({
    description: '퀘스트 시작 시간',
    example: '2025-10-12T10:00:00.000Z',
    required: true,
  })
  @Type(() => Date)
  @IsDate()
  startedAt: Date;

  @ApiProperty({
    description: '퀘스트 종료 시간',
    example: '2025-10-12T10:05:00.000Z',
    required: true,
  })
  @Type(() => Date)
  @IsDate()
  endedAt: Date;

  @ApiProperty({
    description: '퀘스트 총 소요 시간 (초)',
    example: 300,
    required: true,
  })
  @Type(() => Number)
  @IsNumber()
  timeSpent: number;

  @ApiProperty({
    description: '퀘스트 완료 여부', // [TODO] 언제 필요한지 고려해보기
    example: true,
    required: true,
  })
  @IsBoolean()
  doneYn: boolean;

  @ApiProperty({
    description: '총 문제 수',
    example: 10,
    required: true,
  })
  @Type(() => Number)
  @IsNumber()
  totalQuestItemCount: number;

  @ApiProperty({
    description: '정답 문제 수',
    example: 8,
    required: true,
  })
  @Type(() => Number)
  @IsNumber()
  correctQuestItemCount: number;

  @ApiProperty({
    description: '정확도 (%)',
    example: 80.00,
    required: true,
  })
  @Type(() => Number)
  @IsNumber()
  accuracyRate: number;

  @ApiProperty({
    description: '퀘스트 아이템 결과 목록',
    type: [UserQuestItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserQuestItemDto)
  items: UserQuestItemDto[];
}

