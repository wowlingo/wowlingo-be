import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { StudySummaryInfoDto } from '../dto/study-summary-info.dto';
import { SampleProcess } from '../process/sample.process';

@ApiTags('00. 공통 > Sample')
@Controller('v1/sample')
export class SampleController {
  constructor(private readonly sampleProcess: SampleProcess) {}

  @ApiOperation({ summary: '샘플 조회', description: '조회하기 위한 API 입니다.' })
  @Get('hello')
  sayHello(@Query('name') name: string = 'World'): string {
    return `Hello, ${name}!`;
  }

  @ApiOperation({ 
    summary: '간략 학습 조회', 
    description: '학습 > 간략 학습 조회' 
  })
  @ApiParam({ name: 'studyId', description: '학습 ID', type: 'number' })
  @Get('lms/api/v1/study/:studyId/summary-info')
  async getStudySummaryInfo(
    @Param('studyId') studyId: number
  ): Promise<StudySummaryInfoDto> {
    return await this.sampleProcess.getStudySummaryInfo(studyId);
  }
}