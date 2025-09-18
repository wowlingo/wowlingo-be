import { Injectable } from '@nestjs/common';
import { StudySummaryInfoDto } from '../dto/study-summary-info.dto';
import { WebException } from '../common/exception/web.exception';

@Injectable()
export class SampleService {
  constructor() {}

  async getStudyInfo(studyId: number): Promise<StudySummaryInfoDto> {
    // 현재는 더미 데이터를 반환 (데이터베이스 연결 시 실제 데이터 조회)
    const studyInfo: StudySummaryInfoDto = {
      studyId,
      courseId: 1214,
      completeYn: 'Y',
      completeDate: '',
      startDate: '2025.03.27 11:13',
      expirationDate: '9999.12.31 23:59',
      courseTitle: '단어 테스트',
      courseForceFinishYn: 'N',
      courseDiplomaYn: 'N',
      progressRate: 0,
      courseTotalEducationCount: 2,
      studyTotalEducationCount: 0,
      educationDoneYn: 'Y',
      thumbnailFile: '',
      studyFinalStatusCode: 'STUDY_ONGOING',
      studyFinalStatusName: '학습중',
      approvalStatusCode: 'APPROVAL',
      loginId: '아이디',
    };

    return studyInfo;
  }
}