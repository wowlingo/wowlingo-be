import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async findAll(): Promise<Course[]> {
    return this.courseRepository.find({
      relations: ['quests'],
    });
  }

  async findOne(id: number): Promise<Course> {
    return this.courseRepository.findOneOrFail({
      where: { courseId: id },
      relations: ['quests'],
    });
  }

  async create(courseData: Partial<Course>): Promise<Course> {
    const course = this.courseRepository.create(courseData);
    return this.courseRepository.save(course);
  }

  async update(id: number, courseData: Partial<Course>): Promise<Course> {
    await this.courseRepository.update(id, courseData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.courseRepository.delete(id);
  }

  // 난이도별 코스 조회
  async findByType(type: string): Promise<Course[]> {
    return this.courseRepository.find({
      where: { type },
      relations: ['quests'],
    });
  }
}
