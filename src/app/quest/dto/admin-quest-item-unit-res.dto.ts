import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';

export class AdminQuestItemUnitResDto {
  @Type(() => Number)
  @IsNumber()
  questItemUnitId: number;

  @IsString()
  str: string;

  @IsString()
  urlNormal: string;

  @IsString()
  urlSlow: string;

  @IsArray()
  hashtags: string[];
}
