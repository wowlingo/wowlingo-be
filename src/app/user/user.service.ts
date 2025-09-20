import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserCourse } from './entities/user-course.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserCourse)
    private userCourseRepository: Repository<UserCourse>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['userCourses'],
    });
  }

  async findOne(id: number): Promise<User> {
    return this.userRepository.findOneOrFail({
      where: { userId: id },
      relations: ['userCourses'],
    });
  }

  async findByNickname(nickname: string): Promise<User> {
    return this.userRepository.findOneOrFail({
      where: { nickname },
      relations: ['userCourses'],
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: number, userData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, userData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  // 사용자의 코스 등록
  async enrollCourse(userId: number, courseId: number): Promise<UserCourse> {
    const userCourse = this.userCourseRepository.create({
      userId,
      courseId,
      startedAt: new Date(),
    } as Partial<UserCourse>);
    return this.userCourseRepository.save(userCourse);
  }

  // 사용자의 코스 목록 조회
  async getUserCourses(userId: number): Promise<UserCourse[]> {
    return this.userCourseRepository.find({
      where: { userId },
      relations: ['course'],
    });
  }
}
