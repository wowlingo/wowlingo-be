import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { User } from './entities/user.entity'
import { UserQuestAttempt } from './entities/user-quest-attempt.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserQuestAttempt)
    private userQuestAttemptRepository: Repository<UserQuestAttempt>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }
  
  async login(nickname: string): Promise<Boolean> {
    // 1. 이전에 접속한 적 있는 닉네임일 경우 -> 이어서 진행.
    // 2. 접속한 적 없는 닉네임일 경우 -> 신규 진행.
    const user = await this.userRepository.findOne({
      where: { nickname },
      relations: ['userQuestAttempts'],
    });

    if (user) {
      const today = new Date();
      const questAttempt = user.userQuestAttempts.find(attempt => {
        const loginDate = new Date(attempt.loginDate);
        return (
          loginDate.getFullYear() === today.getFullYear() &&
          loginDate.getMonth() === today.getMonth() &&
          loginDate.getDate() === today.getDate()
        );
      });
      // 오늘 접속한 적 있으면.
      if (questAttempt) {
        return true;
      }

      // 오늘 접속 정보 저장.
      const newUserQuestAttempt = this.userQuestAttemptRepository.create({
        userId: user.userId,
        loginDate: new Date(),
      });
      await this.userQuestAttemptRepository.save(newUserQuestAttempt);
    }
    else {
      await this.userRepository.manager.transaction(async (manager) => {
        // 신규 닉네임 저장.
        const newUser = manager.create(User, {
          auth: '',
          authType: '',
          nickname: nickname,
        });
        const savedUser = await manager.save(newUser);

        // 신규 닉네임 접속 정보 저장.
        const newUserQuestAttempt = this.userQuestAttemptRepository.create({
          userId: savedUser.userId,
          loginDate: new Date(),
        });

        await manager.save(UserQuestAttempt, newUserQuestAttempt);

        return true;
      });
    }

    return false;
  }

  async getUserQuestAttempts(userId: number, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    return this.userQuestAttemptRepository.find({
      where: {
        userId: userId,
        loginDate: Between(startDate, endDate)
      },
    });
  }
}
