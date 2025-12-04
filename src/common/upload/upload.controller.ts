import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { BaseResponse } from '../dto/base-response.dto';
import { join } from 'path';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('audio')
  @ApiOperation({ summary: '오디오 파일 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '오디오 파일 (mp3, wav, ogg, webm)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '파일 업로드 성공',
    schema: {
      example: {
        status: 'success',
        message: '파일이 성공적으로 업로드되었습니다.',
        data: {
          url: '/sounds/uuid-filename.mp3',
          originalName: 'my-audio.mp3',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'sounds');
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uploadService = new UploadService();
          const uniqueFilename = uploadService.generateUniqueFilename(file.originalname);
          cb(null, uniqueFilename);
        },
      }),
    }),
  )
  async uploadAudio(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<BaseResponse<{ url: string; originalName: string }>> {
    if (!file) {
      throw new BadRequestException('파일이 제공되지 않았습니다.');
    }

    this.uploadService.validateAudioFile(file);

    const fileUrl = this.uploadService.getFileUrl(file.filename);

    return BaseResponse.success(
      {
        url: fileUrl,
        originalName: file.originalname,
      },
      '파일이 성공적으로 업로드되었습니다.',
    );
  }
}