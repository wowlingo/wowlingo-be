import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class UserLoginDto {
    @ApiProperty({
        description: '사용자 닉네임',
        example: '홍길동',
        required: true,
    })
    @IsString()
    nickname: string;
}