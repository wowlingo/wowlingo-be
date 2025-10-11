import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// 환경 변수 로드
config();

// 엔티티 import
import { User } from '../../app/user/entities/user.entity';
import { Quest } from '../../app/quest/entities/quest.entity';
import { QuestItem } from '../../app/quest/entities/quest-item.entity';
import { QuestItemUnit } from '../../app/quest/entities/quest-item-unit.entity';
import { UserQuest } from '../../app/user-quest/entities/user-quest.entity';
import { UserQuestItem } from '../../app/user-quest/entities/user-quest-item.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'wowlingo',
  charset: 'utf8mb4',
  extra: {
    charset: 'utf8mb4_unicode_ci',
  },
  entities: [User, Quest, QuestItem, QuestItemUnit, UserQuest, UserQuestItem],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  migrations: ['src/infra/persistence/migrations/*.ts'],
  migrationsTableName: 'migrations',
});

// CLI에서 사용할 수 있도록 export
export default AppDataSource;
