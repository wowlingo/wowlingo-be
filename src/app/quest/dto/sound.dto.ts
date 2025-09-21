import { IsNumber, IsString } from 'class-validator';

export class SoundDto {
  @IsNumber()
  id: number;

  @IsString()
  url: string;

  @IsString()
  type: string;
}
