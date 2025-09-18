import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SampleController } from './controllers/sample.controller';
import { SampleService } from './services/sample.service';
import { SampleProcess } from './process/sample.process';
import { Course } from './entities/course.entity';
import { Quest } from './entities/quest.entity';
import { QuestItem } from './entities/quest-item.entity';
import { QuestItemUnit } from './entities/quest-item-unit.entity';
import { User } from './entities/user.entity';
import { UserCourse } from './entities/user-course.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_DATABASE', 'wowlingo'),
        entities: [Course, Quest, QuestItem, QuestItemUnit, User, UserCourse],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
        retryAttempts: 3,
        retryDelay: 3000,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Course, Quest, QuestItem, QuestItemUnit, User, UserCourse]),
  ],
  controllers: [SampleController],
  providers: [SampleService, SampleProcess],
})
export class AppModule {}