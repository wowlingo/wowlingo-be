import { IsString, IsArray, IsOptional, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateQuestItemUnitDto {
  @ApiPropertyOptional({
    description: 'Unit 텍스트 (한글 단어, 문장 등)',
    example: '감자',
  })
  @IsOptional()
  @IsString()
  str?: string;

  @ApiPropertyOptional({
    description: '일반 속도 오디오 파일 URL',
    example: '/sounds/potato-normal.mp3',
  })
  @IsOptional()
  @IsString()
  urlNormal?: string;

  @ApiPropertyOptional({
    description: '느린 속도 오디오 파일 URL',
    example: '/sounds/potato-slow.mp3',
  })
  @IsOptional()
  @IsString()
  urlSlow?: string;

  @ApiPropertyOptional({
    description: 'Hashtag ID 배열 (Unit type 및 카테고리 선택)',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  hashtagIds?: number[];

  @ApiPropertyOptional({
    description: '비고 (메모, 추가 정보)',
    example: '초성 ㄱ 연습용',
  })
  @IsOptional()
  @IsString()
  remark?: string;
}