import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// 엔티티 import (각 모듈에서 가져옴)
import { User } from '../../app/user/entities/user.entity';
import { Quest } from '../../app/quest/entities/quest.entity';
import { QuestItem } from '../../app/quest/entities/quest-item.entity';
import { QuestItemUnit } from '../../app/quest/entities/quest-item-unit.entity';
import { UserQuest } from '../../app/user-quest/entities/user-quest.entity';
import { UserQuestItem } from '../../app/user-quest/entities/user-quest-item.entity';

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
        charset: 'utf8mb4',
        extra: {
          charset: 'utf8mb4_unicode_ci',
        },
        entities: [User, Quest, QuestItem, QuestItemUnit, UserQuest, UserQuestItem],
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
