import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VocabQuestReqDto {

    @ApiProperty({
        description: '사용자 ID',
        example: 1,
        required: true,
    })
    @IsNumber()
    userId: number;

    @ApiProperty({
        description: '문제 ID',
        example: 1,
        required: true,
    })
    @IsNumber()
    questItemId: number;

    // @ApiProperty({
    //     description: '문제 항목 ID',
    //     example: 1,
    //     required: false,
    // })
    // @IsNumber()
    // questItemUnitId: number | null;
}