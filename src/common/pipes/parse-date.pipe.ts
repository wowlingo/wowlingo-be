import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseDatePipe implements PipeTransform {
    transform(value: string): Date {
        const date = new Date(value);

        if (isNaN(date.getTime())) {
            throw new BadRequestException(`유효하지 않은 날짜 형식입니다: ${value}`);
        }

        return date;
    }
}
