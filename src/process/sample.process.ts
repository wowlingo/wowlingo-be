import { Injectable } from '@nestjs/common';
import { StudySummaryInfoDto } from '../dto/study-summary-info.dto';
import { SampleService } from '../services/sample.service';

@Injectable()
export class SampleProcess {
  constructor(private readonly sampleService: SampleService) {}

  async getStudySummaryInfo(studyId: number): Promise<StudySummaryInfoDto> {
    // StudyId 기준 > 학습정보 조회
    const studyInfo = await this.sampleService.getStudyInfo(studyId);
    return studyInfo;
  }
}