import { IsString, IsNumber, IsArray, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuestDto {
  @IsString()
  title: string;

  @IsString()
  type: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(999)
  order: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  questItemCount: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  hashtagIds?: number[];
}
