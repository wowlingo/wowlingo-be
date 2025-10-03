import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsString, ValidateNested } from 'class-validator';
import { QuestDataDto } from '../../quest/dto/quest-data.dto'


export class CourseDataDto {

    @IsNumber()
    courseId: number;

    @IsString()
    title: string;

    @IsString()
    type: string;

    @IsString()
    objective: string;

    @IsNumber()
    totalQuestCount: number;

    @IsNumber()
    doneQuestCount: number;

    @IsBoolean()
    enableYn: boolean;

    // @IsArray()
    // @ValidateNested({ each: true })
    // @Type(() => QuestDataDto)
    // quests: QuestDataDto[];

}