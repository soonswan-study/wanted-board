import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Post } from '../entities/post.entity';
import {
  CreatePostDto,
  UpdatePostDto,
  DeletePostDto,
  PostDto,
} from '../dto/post.dto';
import { NotificationService } from './notification.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { PaginatedResponse } from '../common/dto/paginated-response.dto';
import { PostSearchDto } from '../dto/post-search.dto';
import { toDto } from '../common/transform.util';
import { searchPaginated } from '../common/search/search.util';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private notificationService: NotificationService,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<PostDto> {
    const hashedPassword = await bcrypt.hash(createPostDto.password, 10);

    const post = this.postRepository.create({
      ...createPostDto,
      password: hashedPassword,
    });

    const savedPost = await this.postRepository.save(post);

    // NOTE(swan): 키워드 알림 체크.
    await this.notificationService.checkKeywordAlerts(
      `${createPostDto.title} ${createPostDto.content}`,
    );

    return toDto(PostDto, savedPost);
  }

  async searchPosts(query: PostSearchDto): Promise<PaginatedResponse<PostDto>> {
    return searchPaginated(this.postRepository, query, Post, PostDto);
  }

  async findById(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['comments', 'comments.replies'],
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findById(id);

    const isPasswordValid = await bcrypt.compare(
      updatePostDto.password,
      post.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    await this.postRepository.update(id, {
      title: updatePostDto.title,
      content: updatePostDto.content,
    });

    // NOTE(swan): 수정된 내용에 키워드 알림 체크.
    await this.notificationService.checkKeywordAlerts(
      `${updatePostDto.title} ${updatePostDto.content}`,
    );

    return this.findById(id);
  }

  async remove(id: number, deletePostDto: DeletePostDto): Promise<void> {
    const post = await this.findById(id);

    const isPasswordValid = await bcrypt.compare(
      deletePostDto.password,
      post.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    await this.postRepository.softRemove(post);
  }
}
