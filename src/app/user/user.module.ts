import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserQuestAttempt } from './entities/user-quest-attempt.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserQuestAttempt])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})

export class UserModule {}
