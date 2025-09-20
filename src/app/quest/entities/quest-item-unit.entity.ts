import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { QuestItem } from './quest-item.entity';

@Entity('quest_item_units')
export class QuestItemUnit {
  @PrimaryGeneratedColumn({ name: 'quest_item_unit_id' })
  questItemUnitId: number;

  @Column({ name: 'quest_item_id', type: 'bigint' })
  questItemId: number;

  @Column({ name: 'type', type: 'varchar', length: 20, comment: '유닛 타입' })
  type: string;

  @Column({ name: 'str', type: 'text', nullable: true, comment: '문자열' })
  str: string;

  @Column({ name: 'url_normal', type: 'varchar', length: 500, nullable: true, comment: '일반 URL' })
  urlNormal: string;

  @Column({ name: 'url_slow', type: 'varchar', length: 500, nullable: true, comment: '느린 URL' })
  urlSlow: string;

  @Column({ name: 'remark', type: 'text', nullable: true, comment: '비고' })
  remark: string;

  @ManyToOne(() => QuestItem, questItem => questItem.questItemUnits)
  @JoinColumn({ name: 'quest_item_id' })
  questItem: QuestItem;
}
