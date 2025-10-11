import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { SoundDto } from './sound.dto';

export class QuestItemDataDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SoundDto)
  units: SoundDto[];

  @IsString()
  answer: string;
}


