import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateQuestItemDto {
  @ApiProperty({ description: 'Quest ID', example: 1, required: false })
  @IsOptional()
  @IsInt()
  questId?: number;

  @ApiProperty({ description: 'Quest Item Type', enum: ['choice', 'statement-question', 'same-different'], required: false })
  @IsOptional()
  @IsString()
  @IsIn(['choice', 'statement-question', 'same-different'])
  type?: 'choice' | 'statement-question' | 'same-different';

  @ApiProperty({ description: 'First question unit ID', example: 1, required: false })
  @IsOptional()
  @IsInt()
  question1?: number;

  @ApiProperty({ description: 'Second question unit ID', example: 2, required: false })
  @IsOptional()
  @IsInt()
  question2?: number;

  // For choice type
  @ApiProperty({ description: 'First answer unit ID (for choice type)', example: 1, required: false })
  @IsOptional()
  @IsInt()
  answer1?: number;

  @ApiProperty({ description: 'Second answer unit ID (for choice type)', example: 2, required: false })
  @IsOptional()
  @IsInt()
  answer2?: number;

  @ApiProperty({ description: 'Same/Different answer (for same-different type)', enum: ['same', 'different'], required: false })
  @IsOptional()
  @IsString()
  @IsIn(['same', 'different'])
  answerOx?: string;

  @ApiProperty({ description: 'Statement/Question answer (for statement-question type)', enum: ['statement', 'question'], required: false })
  @IsOptional()
  @IsString()
  @IsIn(['statement', 'question'])
  answerSq?: string;

  @ApiProperty({ description: 'Remark', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}