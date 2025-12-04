import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestItemDto {
  @ApiProperty({ description: 'Quest ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  questId: number;

  @ApiProperty({ description: 'Quest Item Type', enum: ['choice', 'statement-question', 'same-different'] })
  @IsString()
  @IsNotEmpty()
  @IsIn(['choice', 'statement-question', 'same-different'])
  type: 'choice' | 'statement-question' | 'same-different';

  @ApiProperty({ description: 'First question unit ID (required)', example: 1 })
  @IsInt()
  @IsNotEmpty()
  question1: number;

  @ApiProperty({ description: 'Second question unit ID (optional for statement-question, required for same-different)', example: 2, required: false })
  @IsOptional()
  @IsInt()
  question2?: number;

  @ApiProperty({ description: 'First answer unit ID (required for choice type)', example: 1, required: false })
  @ValidateIf(o => o.type === 'choice')
  @IsInt()
  @IsNotEmpty()
  answer1?: number;

  @ApiProperty({ description: 'Second answer unit ID (required for choice type)', example: 2, required: false })
  @ValidateIf(o => o.type === 'choice')
  @IsInt()
  @IsNotEmpty()
  answer2?: number;

  @ApiProperty({ description: 'Same/Different answer (required for same-different type)', enum: ['same', 'different'], required: false })
  @ValidateIf(o => o.type === 'same-different')
  @IsString()
  @IsNotEmpty()
  @IsIn(['same', 'different'])
  answerOx?: string;

  @ApiProperty({ description: 'Statement/Question answer (required for statement-question type)', enum: ['statement', 'question'], required: false })
  @ValidateIf(o => o.type === 'statement-question')
  @IsString()
  @IsNotEmpty()
  @IsIn(['statement', 'question'])
  answerSq?: string;

  @ApiProperty({ description: 'Remark', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}