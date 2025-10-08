import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';

export class VocabDto {

    @IsNumber()
    vocabId: number;

    @IsString()
    str: string;

    @IsString()
    urlNormal: string;

    @IsString()
    urlSlow: string;

    createdAt: Date;

    // @IsArray()
    // @ValidateNested({ each: true })
    // @Type(() => HashTagDataDto)
    // hashtags: HashTagDataDto[];
}