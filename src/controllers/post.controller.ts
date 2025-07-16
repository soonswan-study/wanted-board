import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PostService } from '../services/post.service';
import {
  CreatePostDto,
  UpdatePostDto,
  DeletePostDto,
  PostDto,
} from '../dto/post.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiPaginatedResponse } from 'src/common/decorators/paginated.decorator';
import { PaginatedResponse } from 'src/common/dto/paginated-response.dto';
import { PostSearchDto } from '../dto/post-search.dto';
import { toDto } from '../common/transform.util';

@ApiTags('게시글')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @ApiOperation({ summary: '게시글 작성' })
  create(@Body() createPostDto: CreatePostDto) {
    return this.postService.create(createPostDto);
  }

  @Get()
  @ApiOperation({ summary: '게시글 목록 조회 (페이징, 검색)' })
  @ApiPaginatedResponse(PostDto)
  async searchPosts(
    @Query() query: PostSearchDto,
  ): Promise<PaginatedResponse<PostDto>> {
    return this.postService.searchPosts(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '게시글 상세 조회' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PostDto> {
    const post = await this.postService.findById(id);
    return toDto(PostDto, post);
  }

  @Put(':id')
  @ApiOperation({ summary: '게시글 수정' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postService.update(id, updatePostDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '게시글 삭제' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Body() deletePostDto: DeletePostDto,
  ) {
    return this.postService.remove(id, deletePostDto);
  }
}
