import { ApiProperty } from '@nestjs/swagger';

export class BaseResponse<T = any> {
  @ApiProperty({ description: '성공 여부', example: true })
  result: boolean;

  @ApiProperty({ description: '응답 코드', example: '200' })
  code: string;

  @ApiProperty({ description: '응답 메시지', example: 'Success' })
  message: string;

  @ApiProperty({ description: '응답 데이터' })
  data: T | undefined;

  constructor(result: boolean, code: string, message: string, data?: T) {
    this.result = result;
    this.code = code;
    this.message = message;
    this.data = data;
  }

  static success<T>(data?: T, message = 'Success'): BaseResponse<T> {
    return new BaseResponse(true, '200', message, data);
  }

  static error(code: string, message: string): BaseResponse {
    return new BaseResponse(false, code, message);
  }
}