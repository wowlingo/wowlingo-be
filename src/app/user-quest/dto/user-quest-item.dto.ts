import { Type } from 'class-transformer';
import { IsArray, IsDate, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserQuestItemDto {
  @ApiProperty({
    description: '퀘스트를 수행한 사용자 ID',
    example: 1,
    required: true, 
  })
  @IsNumber()
  userQuestId: number;

  @ApiProperty({
    description: '퀘스트 아이템 ID',
    example: 1,
    required: true,
  })
  @IsNumber()
  questItemId: number;

  @ApiProperty({
    description: '사용자 답안 OX', 
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsString()
  userAnswerOx: string | null;

  @ApiProperty({
    description: '사용자 답안 평서문/의문문',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsString()
  userAnswerSq: string | null;

  @ApiProperty({
    description: '사용자 답안 인덱스',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  userAnswer: number | null;

  @ApiProperty({
    description: '사용자 학습 시도 시간(=문제 제출 시간)',
    example: '2025-09-24T08:05:07.000Z',
    required: false,
  })
  @Type(() => Date)
  @IsDate()
  attemptAt: Date;

  @ApiProperty({
    description: '사용자 문제 JSON',
    example: 1,
    required: false,
  })
  @IsString()
  questItemJson: string;

}