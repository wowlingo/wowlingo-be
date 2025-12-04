import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignUnitToQuestDto {
  @ApiProperty({
    description: 'Quest ID (Unit을 할당할 Quest)',
    example: 1,
  })
  @IsNumber()
  questId: number;
}