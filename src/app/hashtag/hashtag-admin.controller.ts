import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HashtagService } from './hashtag.service';
import { Hashtag } from './entities/hashtag.entity';
import { BaseResponse } from '../../common/dto/base-response.dto';
import { CreateHashtagDto } from './dto/create-hashtag.dto';

@ApiTags('Admin Hashtags')
@Controller('admin/hashtag')
export class HashtagAdminController {
  constructor(private readonly hashtagService: HashtagService) {}

  @Post()
  @ApiOperation({ summary: '새 해시태그 생성' })
  @ApiResponse({
    status: 201,
    description: '해시태그 생성 성공',
    schema: {
      example: {
        status: 'success',
        message: '해시태그가 성공적으로 생성되었습니다.',
        data: { hashtagId: 1, code: 'new-code', name: '새 해시태그' },
      },
    },
  })
  async create(@Body() dto: CreateHashtagDto): Promise<BaseResponse<Hashtag>> {
    const hashtag = await this.hashtagService.create(dto);
    return BaseResponse.success(hashtag, '해시태그가 성공적으로 생성되었습니다.');
  }
}
