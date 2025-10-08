import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// 환경 변수 로드
config();

// 엔티티 import
import { User } from '../../app/user/entities/user.entity';
import { UserCourse } from '../../app/user/entities/user-course.entity';
import { Course } from '../../app/course/entities/course.entity';
import { Quest } from '../../app/quest/entities/quest.entity';
import { QuestItem } from '../../app/quest/entities/quest-item.entity';
import { QuestItemUnit } from '../../app/quest/entities/quest-item-unit.entity';
import { Hashtag } from '../../app/hashtag/entities/hashtag.entity';
import { QuestHashtag } from '../../app/hashtag/entities/quest-hashtag.entity';
import { QuestItemUnitHashtag } from '../../app/hashtag/entities/quest-item-unit-hashtag.entity';
import { VocabHashtag } from '../../app/hashtag/entities/vocab-hashtag.entity';
import { UserQuest } from '../../app/user-quest/entities/user-quest.entity';
import { UserQuestItem } from '../../app/user-quest/entities/user-quest-item.entity';
import { Vocabulary } from '../../app/vocabulary/entities/vocabulary.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'wowlingo',
  entities: [
    User,
    UserCourse,
    Course,
    Quest,
    QuestItem,
    QuestItemUnit,
    Hashtag,
    QuestHashtag,
    QuestItemUnitHashtag,
    VocabHashtag,
    UserQuest,
    UserQuestItem,
    Vocabulary,
  ],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  migrations: ['src/infra/persistence/migrations/*.ts'],
  migrationsTableName: 'migrations',
  timezone: 'Asia/Seoul',
  dateStrings: true,
});

// CLI에서 사용할 수 있도록 export
export default AppDataSource;