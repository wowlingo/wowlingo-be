import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SentenceTestRequestDto {
  @IsNumber()
  questId: number;
}

export class CheckAnswerRequestDto {
  @IsNumber()
  questItemId: number;

  @IsNumber()
  userAnswerUnitId: number; // quest_item_unit_id
}

export class CheckAnswerResponseDto {
  isCorrect: boolean;
  correctAnswerUnitId: number;
  correctAnswerText: string;
  explanation?: string;
}

export class AddToWrongNotesRequestDto {
  @IsNumber()
  questItemId: number;

  @IsNumber()
  userAnswerUnitId: number;

  @IsNumber()
  userId: number;
}

export class SentenceTestResponseDto {
  questId: number;
  title: string;
  description?: string;
  totalQuestions: number;
  questions: SentenceQuestionResponseDto[];
}

export class SentenceQuestionResponseDto {
  questItemId: number;
  questionOrder: number;
  audioUrl: string;
  slowAudioUrl?: string;
  correctAnswerUnitId: number;
  correctAnswerText: string;
  options: SentenceOptionResponseDto[];
  explanation?: string;
}

export class SentenceOptionResponseDto {
  questItemUnitId: number;
  text: string;
}
