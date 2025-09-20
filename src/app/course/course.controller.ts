import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CourseService } from './course.service';
import { Course } from './entities/course.entity';
import { BaseResponse } from '../../common/dto/base-response.dto';

@ApiTags('Courses')
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  @ApiOperation({ summary: '모든 코스 조회' })
  @ApiQuery({ name: 'type', required: false, description: '코스 타입 필터' })
  @ApiResponse({ status: 200, description: '코스 목록 조회 성공' })
  async findAll(
    @Query('type') type?: string,
  ): Promise<BaseResponse<Course[]>> {
    let courses: Course[];
    
    if (type) {
      courses = await this.courseService.findByType(type);
    } else {
      courses = await this.courseService.findAll();
    }
    
    return BaseResponse.success(courses, '코스 목록을 성공적으로 조회했습니다.');
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 코스 조회' })
  @ApiResponse({ status: 200, description: '코스 조회 성공' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<BaseResponse<Course>> {
    const course = await this.courseService.findOne(id);
    return BaseResponse.success(course, '코스 정보를 성공적으로 조회했습니다.');
  }

  @Post()
  @ApiOperation({ summary: '새 코스 생성' })
  @ApiResponse({ status: 201, description: '코스 생성 성공' })
  async create(@Body() courseData: Partial<Course>): Promise<BaseResponse<Course>> {
    const course = await this.courseService.create(courseData);
    return BaseResponse.success(course, '코스가 성공적으로 생성되었습니다.');
  }

  @Put(':id')
  @ApiOperation({ summary: '코스 정보 수정' })
  @ApiResponse({ status: 200, description: '코스 정보 수정 성공' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() courseData: Partial<Course>,
  ): Promise<BaseResponse<Course>> {
    const course = await this.courseService.update(id, courseData);
    return BaseResponse.success(course, '코스 정보가 성공적으로 수정되었습니다.');
  }

  @Delete(':id')
  @ApiOperation({ summary: '코스 삭제' })
  @ApiResponse({ status: 200, description: '코스 삭제 성공' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<BaseResponse<void>> {
    await this.courseService.remove(id);
    return BaseResponse.success(undefined, '코스가 성공적으로 삭제되었습니다.');
  }
}
