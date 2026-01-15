import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateHashtagDto {
  @IsString()
  @IsNotEmpty({ message: 'code는 필수입니다' })
  @MaxLength(50, { message: 'code는 50자를 초과할 수 없습니다' })
  code: string;

  @IsString()
  @IsNotEmpty({ message: 'name은 필수입니다' })
  @MaxLength(100, { message: 'name은 100자를 초과할 수 없습니다' })
  name: string;
}
