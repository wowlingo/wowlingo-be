import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// 인프라 모듈
import { OrmModule } from './infra/persistence/orm.module';

// 공통 모듈
import { UploadModule } from './common/upload/upload.module';

// 애플리케이션 모듈들
import { UserModule } from './app/user/user.module';
import { QuestModule } from './app/quest/quest.module';
import { UserQuestModule } from './app/user-quest/user-quest.module';
import { VocabularyModule } from './app/vocabulary/vocabulary.module';

@Module({
  imports: [
    // 전역 설정
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV
        ? `.env.${process.env.NODE_ENV}`
        : '.env',
    }),

    // 인프라 모듈 (ORM 설정)
    OrmModule,

    // 공통 모듈
    UploadModule,

    // 애플리케이션 모듈들
    UserModule,
    QuestModule,
    UserQuestModule,
    VocabularyModule,
  ],
})
export class AppModule { }