import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// 엔티티 import (각 모듈에서 가져옴)
import { User } from '../../app/user/entities/user.entity';
import { UserCourse } from '../../app/user/entities/user-course.entity';
import { Course } from '../../app/course/entities/course.entity';
import { Quest } from '../../app/quest/entities/quest.entity';
import { QuestItem } from '../../app/quest/entities/quest-item.entity';
import { QuestItemUnit } from '../../app/quest/entities/quest-item-unit.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_DATABASE', 'wowlingo'),
        entities: [User, UserCourse, Course, Quest, QuestItem, QuestItemUnit],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
        retryAttempts: 3,
        retryDelay: 3000,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class OrmModule {}
