import { ApiProperty } from '@nestjs/swagger';

export class StudySummaryInfoDto {
  @ApiProperty({ description: '학습id', example: 1 })
  studyId: number;

  @ApiProperty({ description: '코스id', example: 1214 })
  courseId: number;

  @ApiProperty({ description: '완료 여부', example: 'Y' })
  completeYn: string;

  @ApiProperty({ description: '완료일', example: '' })
  completeDate: string;

  @ApiProperty({ description: '시작일', example: '2025.03.27 11:13' })
  startDate: string;

  @ApiProperty({ description: '만료일', example: '9999.12.31 23:59' })
  expirationDate: string;

  @ApiProperty({ description: '코스 제목', example: '단어 테스트' })
  courseTitle: string;

  @ApiProperty({ description: '강제 완료 여부', example: 'N' })
  courseForceFinishYn: string;

  @ApiProperty({ description: '코스 수료증 여부', example: 'N' })
  courseDiplomaYn: string;

  @ApiProperty({ description: '진행률', example: 0 })
  progressRate: number;

  @ApiProperty({ description: '코스 총 교육 수', example: 2 })
  courseTotalEducationCount: number;

  @ApiProperty({ description: '학습 총 교육 수', example: 0 })
  studyTotalEducationCount: number;

  @ApiProperty({ description: '교육 완료 여부', example: 'Y' })
  educationDoneYn: string;

  @ApiProperty({ description: '썸네일 파일', example: '' })
  thumbnailFile: string;

  @ApiProperty({ description: '학습 최종 상태 코드', example: 'STUDY_ONGOING' })
  studyFinalStatusCode: string;

  @ApiProperty({ description: '학습 최종 상태명', example: '학습중' })
  studyFinalStatusName: string;

  @ApiProperty({ description: '승인 상태 코드', example: 'APPROVAL' })
  approvalStatusCode: string;

  @ApiProperty({ description: '로그인 아이디', example: '아이디' })
  loginId: string;
}