import { IsString, IsArray, IsOptional, IsNumber, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuestItemUnitDto {
  @ApiProperty({
    description: 'Quest Item Unit 텍스트 (한글 단어, 문장 등)',
    example: '감자',
  })
  @IsString()
  str: string;

  @ApiProperty({
    description: '일반 속도 오디오 파일 URL',
    example: '/sounds/potato-normal.mp3',
  })
  @IsString()
  urlNormal: string;

  @ApiProperty({
    description: '느린 속도 오디오 파일 URL',
    example: '/sounds/potato-slow.mp3',
  })
  @IsString()
  urlSlow: string;

  @ApiProperty({
    description: 'Hashtag ID 배열',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @ArrayMinSize(1, { message: '최소 1개 이상의 해시태그를 선택해야 합니다.' })
  @IsNumber({}, { each: true })
  hashtagIds: number[];

  @ApiPropertyOptional({
    description: 'Quest ID (생성 시 특정 Quest에 할당하려면 제공)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  questId?: number;

  @ApiPropertyOptional({
    description: '비고 (메모, 추가 정보)',
    example: '초성 ㄱ 연습용',
  })
  @IsOptional()
  @IsString()
  remark?: string;
}