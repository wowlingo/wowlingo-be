import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { BaseResponse } from '../../common/dto/base-response.dto';
import { UserLoginDto } from './dto/user-login.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: '새 사용자 생성' })
  @ApiResponse({ status: 201, description: '사용자 생성 성공' })
  async create(@Body() userData: Partial<User>): Promise<BaseResponse<User>> {
    const user = await this.userService.create(userData);
    return BaseResponse.success(user, '사용자가 성공적으로 생성되었습니다.');
  }

  @Post('/login')
  @ApiOperation({ summary: '사용자 로그인(by 닉네임)' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  async login(@Body() userLogin: UserLoginDto): Promise<BaseResponse<any>> {

    // validation
    if (!userLogin.nickname) {
      throw new BadRequestException('사용자 닉네임을 확인해주세요.');
    }

    const userlogin = await this.userService.login(userLogin.nickname);
    return BaseResponse.success(userlogin, '로그인 성공하였습니다.');
  }


  @Get(':id/quest-attempts')
  @ApiOperation({ summary: '사용자 접속 정보 조회' })
  @ApiResponse({ status: 200, description: '사용자 접속 정보 조회 성공' })
  async getQuestAttempts(
    @Param('id', ParseIntPipe) userId: number,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ): Promise<BaseResponse<any>> {
    const userQuestAttempts = await this.userService.getUserQuestAttempts(userId, year, month);
    return BaseResponse.success(userQuestAttempts, '사용자 정보 정보를 성공적으로 조회했습니다.');
  }

  @Get(':id/quest-attempts/this-week')
  @ApiOperation({ summary: '사용자 이번주 학습현황' })
  @ApiResponse({ status: 200, description: '사용자 이번주 학습현황 조회 성공' })
  async getQuestAttemptsThisWeek(
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<BaseResponse<any>> {
    // 월 화 수 목 금 토
    const userQuestAttempts = await this.userService.getUserQuestAttemptsThisWeek(userId);
    return BaseResponse.success(userQuestAttempts, '사용자 정보 정보를 성공적으로 조회했습니다.');
  }

  @Get(':id/quest-attempts/ai')
  @ApiOperation({ summary: '사용자 ai 학습 정보 조회' })
  @ApiResponse({ status: 200, description: '사용자 ai 학습 정보 성공' })
  async getAiFeedback(
    @Param('id', ParseIntPipe) userId: number,
    @Query('userQuestAttemptId', ParseIntPipe) userQuestAttemptId: number,
  ): Promise<BaseResponse<any>> {
    const userQuestAttempts = await this.userService.getUserAiFeedback(userId, userQuestAttemptId);
    return BaseResponse.success(userQuestAttempts, '사용자 ai 학습 정보를 성공적으로 조회했습니다.');
  }

}
