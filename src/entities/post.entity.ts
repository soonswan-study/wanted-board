import { Entity, Column, OneToMany } from 'typeorm';
import { Comment } from './comment.entity';
import { BaseEntity } from './base.entity';

@Entity('posts')
export class Post extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 100, name: 'author_name' })
  authorName: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
}
