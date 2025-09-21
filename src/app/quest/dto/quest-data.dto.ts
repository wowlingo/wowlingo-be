import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { QuestItemDataDto } from './quest-item-data.dto';

export class QuestDataDto {
  @IsNumber()
  questId: number;

  @IsString()
  title: string;

  @IsString()
  type: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestItemDataDto)
  items: QuestItemDataDto[];
}