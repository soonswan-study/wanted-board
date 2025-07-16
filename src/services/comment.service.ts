import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { CreateCommentDto } from '../dto/comment.dto';
import { NotificationService } from './notification.service';
import { CommentDto } from '../dto/comment.dto';
import { CommentSearchDto } from '../dto/comment-search.dto';
import { searchPaginated } from '../common/search/search.util';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private notificationService: NotificationService,
  ) {}

  async create(
    postId: number,
    { content, parentId, ...rest }: CreateCommentDto,
  ): Promise<Comment> {
    let checkedParentId: number | null = null;
    if (typeof parentId === 'number' && parentId > 0) {
      const parentComment = await this.findById(parentId);
      if (!parentComment) {
        throw new BadRequestException('존재하지 않는 부모 댓글입니다.');
      }
      checkedParentId = parentId;
    }

    const comment = this.commentRepository.create({
      ...rest,
      content,
      postId,
      parentId: checkedParentId,
    });

    const savedComment = await this.commentRepository.save(comment);

    await this.notificationService.checkKeywordAlerts(content);

    return savedComment;
  }

  async searchCommentsByPostId(postId: number, query: CommentSearchDto) {
    return searchPaginated(
      this.commentRepository,
      query,
      Comment,
      CommentDto,
      ['replies'],
      (qb) =>
        qb
          .andWhere('comment.postId = :postId', { postId })
          .andWhere('comment.parentId IS NULL'),
    );
  }

  async findById(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['replies'],
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    return comment;
  }
}
