import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';

export class QuestResDto {
  @Type(() => Number)
  @IsNumber()
  questId: number;

  @Type(() => Number)
  @IsNumber()
  questItemCount: number;

  order: number;

  @IsString()
  title: string;

  @IsString()
  type: string;

  @IsArray()
  hashtags: string[];

}
