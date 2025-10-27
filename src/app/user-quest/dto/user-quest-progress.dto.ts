import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserQuestProgressDto {
  @ApiProperty({
    description: '유저 퀘스트 진행 상황 ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  userQuestProgressId?: number;

  @ApiProperty({
    description: '유저 ID',
    example: 1,
    required: true,
  })
  @Type(() => Number)
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: '퀘스트 ID',
    example: 1,
    required: true,
  })
  @Type(() => Number)
  @IsNumber()
  questId: number;

  @ApiProperty({
    description: '전체 문제 개수',
    example: 70,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalTargetCount?: number;

  @ApiProperty({
    description: '통과 기준 정답 개수',
    example: 50,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  passThreshold?: number;

  @ApiProperty({
    description: '맞힌 문제(정답) 개수',
    example: 35,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  correctCount?: number;

  @ApiProperty({
    description: '퀘스트 완료 여부(pass_threshold 이상 맞힌 경우)',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  doneYn?: boolean;

  @ApiProperty({
    description: '마지막 플레이 시간',
    example: '2025-09-24T08:05:37.000Z',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  lastPlayedAt?: Date | null;
}