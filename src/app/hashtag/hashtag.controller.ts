import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HashtagService } from './hashtag.service';
import { Hashtag } from './entities/hashtag.entity';
import { BaseResponse } from '../../common/dto/base-response.dto';

@ApiTags('Hashtags')
@Controller('hashtags')
export class HashtagController {
  constructor(private readonly hashtagService: HashtagService) {}

  @Get()
  @ApiOperation({ summary: '모든 해시태그 조회' })
  @ApiResponse({
    status: 200,
    description: '해시태그 목록 조회 성공',
    schema: {
      example: {
        status: 'success',
        message: '해시태그 목록을 성공적으로 조회했습니다.',
        data: [
          { hashtagId: 1, code: 'code1', name: '환경음' },
          { hashtagId: 2, code: 'code2', name: '말소리' },
        ],
      },
    },
  })
  async findAll(): Promise<BaseResponse<Hashtag[]>> {
    const hashtags = await this.hashtagService.findAll();
    return BaseResponse.success(hashtags, '해시태그 목록을 성공적으로 조회했습니다.');
  }
}
