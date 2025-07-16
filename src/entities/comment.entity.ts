import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Post } from './post.entity';
import { BaseEntity } from './base.entity';

@Entity('comments')
export class Comment extends BaseEntity {
  @Column({ type: 'int', name: 'post_id' })
  postId: number;

  @Column({ type: 'int', nullable: true, name: 'parent_id' })
  parentId: number | null;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 100, name: 'author_name' })
  authorName: string;

  @ManyToOne(() => Post, (post) => post.comments)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => Comment, (comment) => comment.replies)
  @JoinColumn({ name: 'parent_id' })
  parent: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies: Comment[];
}
