import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { SoundDto } from './sound.dto';

export class OptionDto {
  type?: string;
  label: string;
  id?: number;
}

export class QuestItemDataDto {
  questItemId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SoundDto)
  units: SoundDto[];

  // answer는 string (statement-question, same-different) 또는 number (기타 타입의 quest item unit id)
  answer: string | number | null;

  // 선택지 (statement-question, same-different, choice 등)
  options?: OptionDto[];
}

