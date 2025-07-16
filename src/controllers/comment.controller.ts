import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { CommentService } from '../services/comment.service';
import { CreateCommentDto } from '../dto/comment.dto';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ApiPaginatedResponse } from 'src/common/decorators/paginated.decorator';
import { CommentDto } from 'src/dto/comment.dto';
import { CommentSearchDto } from '../dto/comment-search.dto';

@ApiTags('댓글')
@Controller('posts/:postId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @ApiOperation({ summary: '댓글 작성' })
  @ApiParam({ name: 'postId', type: Number, description: '게시글 ID' })
  create(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentService.create(postId, createCommentDto);
  }

  @Get()
  @ApiOperation({ summary: '댓글 목록 조회 (페이징)' })
  @ApiParam({ name: 'postId', type: Number, description: '게시글 ID' })
  @ApiPaginatedResponse(CommentDto)
  searchCommentsByPostId(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() query: CommentSearchDto,
  ) {
    return this.commentService.searchCommentsByPostId(postId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: '댓글 상세 조회' })
  @ApiParam({ name: 'postId', type: Number, description: '게시글 ID' })
  @ApiParam({ name: 'id', type: Number, description: '댓글 ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.commentService.findById(id);
  }
}
