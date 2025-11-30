import { Injectable, BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  getFileUrl(filename: string): string {
    return `/sounds/${filename}`;
  }

  generateUniqueFilename(originalName: string): string {
    const fileExtension = extname(originalName);
    // TODO sounds 파일명 규칙에 맞게 변경
    const uniqueName = `${uuidv4()}${fileExtension}`;
    return uniqueName;
  }

  validateAudioFile(file: Express.Multer.File): void {
    const allowedMimeTypes = [
      'audio/mpeg',
      'audio/wav',
      'audio/wave',
      'audio/x-wav',
      'audio/mp3',
      'audio/ogg',
      'audio/webm',
    ];

    const allowedExtensions = ['.mp3', '.wav', '.ogg', '.webm'];
    const fileExtension = extname(file.originalname).toLowerCase();

    if (!allowedMimeTypes.includes(file.mimetype) && !allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException(
        '오디오 파일만 업로드 가능합니다. (지원 형식: mp3, wav, ogg, webm)'
      );
    }
  }
}