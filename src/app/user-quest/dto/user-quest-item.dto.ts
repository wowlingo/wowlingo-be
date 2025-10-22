import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserQuestItemDto {
  @ApiProperty({
    description: '퀘스트 아이템 ID',
    example: 1,
    required: true,
  })

  @Type(() => Number)
  @IsNumber()
  questItemId: number;

  @ApiProperty({
    description: '사용자 답안(선택한 답변 or Same/Different 답변 or 평서문/의문문 답변)',
    example: '13',
    required: false,
  })
  @Type(() => Text)
  @IsString()
  userAnswer: string;

  @ApiProperty({
    description: '정답 여부',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  correctYn: boolean;

  @ApiProperty({
    description: '소요 시간 (초)',
    example: 30,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  timeSpent: number;

  @ApiProperty({
    description: '시도 횟수',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  attemptCount: number;

  @ApiProperty({
    description: '시작 시간',
    example: '2025-09-24T08:05:07.000Z',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startedAt: Date;

  @ApiProperty({
    description: '종료 시간',
    example: '2025-09-24T08:05:37.000Z',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endedAt: Date;
}
