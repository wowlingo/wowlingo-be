import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { QuestItemUnit } from '../../quest/entities/quest-item-unit.entity'
import { QuestItem } from '../../quest/entities/quest-item.entity'

export class AdminQuestItemResDto {
  @Type(() => Number)
  @IsNumber()
  questItemId: number;

  @Type(() => Number)
  @IsNumber()
  questId: number;

  @IsString()
  type: string;

  @IsString()
  answerOx: string | null;

  @IsString()
  answerSq: string | null;

  @IsString()
  answer1: string | null;

  @IsString()
  answer2: string | null;

  @IsString()
  remark: string | null;

  questUnit1: QuestItemUnit | null;

  questUnit2: QuestItemUnit | null;
  
  // @Type(() => Number)
  // @IsNumber()
  // unit1Id: number;

  // @IsString()
  // unit1_name: string;

  // @IsString()
  // unit1_normal: string;

  // @IsString()
  // unit1_slow: string;

  // @IsString()
  // unit2_name: string;

  // @IsString()
  // unit2_normal: string;

  // @IsString()
  // unit2_slow: string;

  // @IsString()
  // answer: string;
}
