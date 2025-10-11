import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserQuest } from '../../user-quest/entities/user-quest.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({ name: 'auth_type', type: 'varchar', length: 20, comment: '인증 타입 (google, kakao, apple 등)' })
  authType: string;

  @Column({ name: 'auth', type: 'varchar', length: 100, comment: '외부 인증 ID' })
  auth: string;

  @Column({ name: 'nickname', type: 'varchar', length: 50, comment: '닉네임' })
  nickname: string;

  @OneToMany(() => UserQuest, userQuest => userQuest.user)
  userQuests: UserQuest[];
}
