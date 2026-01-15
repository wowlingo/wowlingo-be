import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';

export class AdminQuestItemUnitResDto {
  @Type(() => Number)
  @IsNumber()
  questItemUnitId: number;

  @IsString()
  str: string;
  // TODO deprecated하거나, type enum 지정 필요. quest_items와의 일관성 고려 혹은 hashtag
  @IsString()
  type: string;

  @IsString()
  urlNormal: string;

  @IsString()
  urlSlow: string;

  @IsArray()
  hashtags: string[];
}
