import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { BaseResponse } from '../../common/dto/base-response.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: '모든 사용자 조회' })
  @ApiResponse({ status: 200, description: '사용자 목록 조회 성공' })
  async findAll(): Promise<BaseResponse<User[]>> {
    const users = await this.userService.findAll();
    return BaseResponse.success(users, '사용자 목록을 성공적으로 조회했습니다.');
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 사용자 조회' })
  @ApiResponse({ status: 200, description: '사용자 조회 성공' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<BaseResponse<User>> {
    const user = await this.userService.findOne(id);
    return BaseResponse.success(user, '사용자 정보를 성공적으로 조회했습니다.');
  }

  @Post()
  @ApiOperation({ summary: '새 사용자 생성' })
  @ApiResponse({ status: 201, description: '사용자 생성 성공' })
  async create(@Body() userData: Partial<User>): Promise<BaseResponse<User>> {
    const user = await this.userService.create(userData);
    return BaseResponse.success(user, '사용자가 성공적으로 생성되었습니다.');
  }

  @Put(':id')
  @ApiOperation({ summary: '사용자 정보 수정' })
  @ApiResponse({ status: 200, description: '사용자 정보 수정 성공' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() userData: Partial<User>,
  ): Promise<BaseResponse<User>> {
    const user = await this.userService.update(id, userData);
    return BaseResponse.success(user, '사용자 정보가 성공적으로 수정되었습니다.');
  }

  @Delete(':id')
  @ApiOperation({ summary: '사용자 삭제' })
  @ApiResponse({ status: 200, description: '사용자 삭제 성공' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<BaseResponse<void>> {
    await this.userService.remove(id);
    return BaseResponse.success(undefined, '사용자가 성공적으로 삭제되었습니다.');
  }

}
