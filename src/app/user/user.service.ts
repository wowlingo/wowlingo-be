import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['userQuests'],
    });
  }

  async findOne(id: number): Promise<User> {
    return this.userRepository.findOneOrFail({
      where: { userId: id },
      relations: ['userQuests'],
    });
  }

  async findByNickname(nickname: string): Promise<User> {
    return this.userRepository.findOneOrFail({
      where: { nickname },
      relations: ['userQuests'],
    });
  }

  async findByAuth(authType: string, auth: string): Promise<User> {
    return this.userRepository.findOneOrFail({
      where: { authType, auth },
      relations: ['userQuests'],
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
}