import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { CourseDataDto } from './course-data.dto';

export class HomeDto {
  @IsNumber()
  totalCount: number;

  @IsNumber()
  latestCourseIdx: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseDataDto)
  courses: CourseDataDto[];
}