import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';

export class AdminQuestResDto {
  @Type(() => Number)
  @IsNumber()
  questId: number;

  @IsString()
  title: string;

  @IsString()
  type: string;

  @Type(() => Number)
  @IsNumber()
  order: number;

  @Type(() => Number)
  @IsNumber()
  questItemCount: number;

  @Type(() => Number)
  @IsNumber()
  actualItemCount: number; // 실제 등록된 Quest Item 개수

  @IsArray()
  hashtags: string[];
}
