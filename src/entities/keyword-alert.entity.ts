import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('keyword_alerts')
export class KeywordAlert extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true, name: 'author_name' })
  authorName: string;

  @Column({ type: 'varchar', length: 100 })
  keyword: string;
}
