import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { UserQuestAttempt } from './entities/user-quest-attempt.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AiFeedback } from './entities/ai-feedback.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserQuestAttempt, AiFeedback]),
    JwtModule.register({
      secret: 'wowlingo',
      signOptions: { expiresIn: '30d' }, // 토큰 만료 시간
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})

export class UserModule {}
