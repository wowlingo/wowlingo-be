import { IsString, IsNumber, IsArray, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateQuestDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(999)
  @IsOptional()
  order?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  questItemCount?: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  hashtagIds?: number[];
}
