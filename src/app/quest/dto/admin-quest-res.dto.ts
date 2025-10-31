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

  @IsArray()
  hashtags: string[];
}
